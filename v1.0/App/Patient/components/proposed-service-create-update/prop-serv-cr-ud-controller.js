(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller(
      'ProposedServiceCreateUpdateController',
      ProposedServiceCreateUpdateController
    );

  ProposedServiceCreateUpdateController.$inject = [
    '$scope',
    '$location',
    '$attrs',
    '$filter',
    'StaticData',
    '$rootScope',
    'AmfaKeys',
    'PatientOdontogramFactory',
    'patSecurityService',
    'ListHelper',
    'PatientServices',
    'PatientLogic',
    '$routeParams',
    'localize',
    'toastrFactory',
    'locationService',
    'SaveStates',
    'TreatmentPlansFactory',
    'UserServices',
    'PatientLandingFactory',
    'UsersFactory',
    '$timeout',
    'PatientServicesFactory',
    '$q',
    'PatientValidationFactory',
    'ProposedServiceFactory',
    'TimeZoneFactory',
    'referenceDataService',
    'AppointmentServiceProcessingRulesService',
    'SchedulingApiService',
    'ServiceCodesService',
  ];

  /**
   *
   * @param {*} $scope
   * @param {angular.ILocationService} $location
   * @param {*} $attrs
   * @param {angular.IFilterService} $filter
   * @param {*} staticData
   * @param {angular.IRootScopeService} $rootScope
   * @param {*} AmfaKeys
   * @param {*} patientOdontogramFactory
   * @param {*} patSecurityService
   * @param {*} listHelper
   * @param {*} patientServices
   * @param {*} patientLogic
   * @param {*} $routeParams
   * @param {*} localize
   * @param {*} toastrFactory
   * @param {*} locationService
   * @param {*} saveStates
   * @param {*} treatmentPlansFactory
   * @param {*} userServices
   * @param {*} patientLandingfactory
   * @param {*} usersFactory
   * @param {angular.ITimeoutService} $timeout
   * @param {*} patientServicesFactory
   * @param {angular.IQService} $q
   * @param {*} patientValidationFactory
   * @param {*} proposedServiceFactory
   * @param {*} timeZoneFactory
   * @param {{ getData: (entity: string) => angular.IPromise<any>; entityNames: Record<string, string>; }} referenceDataService
   * @param {*} appointmentServiceProcessingRulesService
   * @param {*} schedulingApiService
   * @param {*} serviceCodesService
   */
  function ProposedServiceCreateUpdateController(
    $scope,
    $location,
    $attrs,
    $filter,
    staticData,
    $rootScope,
    AmfaKeys,
    patientOdontogramFactory,
    patSecurityService,
    listHelper,
    patientServices,
    patientLogic,
    $routeParams,
    localize,
    toastrFactory,
    locationService,
    saveStates,
    treatmentPlansFactory,
    userServices,
    patientLandingfactory,
    usersFactory,
    $timeout,
    patientServicesFactory,
    $q,
    patientValidationFactory,
    proposedServiceFactory,
    timeZoneFactory,
    referenceDataService,
    appointmentServiceProcessingRulesService,
    schedulingApiService,
    serviceCodesService
  ) {
    BaseCtrl.call(this, $scope, 'ProposedServiceCreateUpdateController');

    var ctrl = this;
    // use this to prevent unneeded method calls during close of modal
    $scope.canSave = true;
    $scope.allowEditing = true;
    $scope.allowProviderEditing = true;
    $scope.showProviderSelector = false;
    $scope.showProviderSelectorForAppointmentServices = false;
    $scope.modalClosing = false;
    $scope.loadProviderSelector = true;
    $scope.existingService = false;
    $scope.referredService = false;
    $scope.originalCode = null;
    patientServicesFactory.ActiveToothCtrlsScopeId = $scope.$id;
    $scope.dataHasChanged = false;
    $scope.saving = false;
    $scope.formIsValid = false;
    $scope.checkData = true;
    $scope.mode = $attrs.mode;
    $scope.isSwiftCode = JSON.parse($attrs.isswiftcode);
    $scope.isFirstCode = JSON.parse($attrs.isfirstcode);
    $scope.isLastcode = JSON.parse($attrs.islastcode);
    $scope.isEdit = $attrs.isedit ? JSON.parse($attrs.isedit) : false;
    $scope.isNewTreatmentPlan =
      $attrs.isNewTreatmentPlan === 'undefined' ||
      _.isUndefined($attrs.isNewTreatmentPlan)
        ? false
        : JSON.parse($attrs.isNewTreatmentPlan);
    $scope.isEditTreatmentPlan =
      $attrs.isEditTreatmentPlan === 'undefined' ||
      _.isUndefined($attrs.isEditTreatmentPlan)
        ? false
        : JSON.parse($attrs.isEditTreatmentPlan);
    $scope.isFromAppointmentModal =
      $attrs.isFromAppointmentModal === 'undefined' ||
      _.isUndefined($attrs.isFromAppointmentModal)
        ? false
        : JSON.parse($attrs.isFromAppointmentModal);
    $scope.treatmentPlanId =
      $attrs.treatmentPlanId === 'null' || _.isUndefined($attrs.treatmentPlanId)
        ? null
        : $attrs.treatmentPlanId;
    $scope.stageNumber = $attrs.stageNumber;
    $scope.locationsDisabled = false;
    $scope.statusDisabled = false;
    $scope.originalActiveTeeth = [];
    $scope.serviceLocationMatch = false;
    $scope.isTreatmentPlan = $attrs.istreatmentplan;
    $scope.treatmentPlanName = $attrs.treatmentplanname;
    $scope.treatmentPlanGroupNumber = $attrs.treatmentplangroupnumber;
    $scope.originalSmartCode = null;
    $scope.smartCodeGroup = [];
    $scope.nextSmartCode = {};
    $scope.isLocationChanged = false;
    ctrl.filteredProvidersResult = [];
    $scope.activeQuadrant = {};
    $scope.activeSurfaces = [];
    $scope.activeArch = {};
    $scope.stageSelected = { number: null };
    $scope.originalServiceFee = null;
    ctrl.isload = true;
    // adding this for the chart button implementation for now, listening for changes to updatedpropServCtrlsParams in charting-controls-controller.js
    // trying improve performance (beta feedback) by not re-instantiating the tooth controls directive everytime the add service window opens
    if (
      $scope.$parent &&
      $scope.$parent.$parent &&
      $scope.$parent.$parent.$watch
    ) {
      $scope.$parent.$parent.$watch(
        'updatedpropServCtrlsParams',
        function (nv, ov) {
          if (nv && !angular.equals(nv, ov)) {
            $scope.modalClosing = false;
            $scope.loadProviderSelector = false;
            $scope.serviceTransaction = {};
            $scope.existingService = false;
            ctrl.setAllowEditing();
            $scope.referredService = false;
            $scope.originalSmartCode = null;
            $scope.smartCodeGroup = [];
            $scope.nextSmartCode = {};
            $scope.mode = nv.mode;
            $scope.detailedActiveTeeth = [];
            // needs to be reset on reload
            $timeout(function () {
              $scope.existingService = false;
              $scope.referredService = false;
              $scope.serviceTransaction.ServiceTransactionStatusId = '1';
            });
            $scope.saving = false;
            $scope.isSwiftCode = nv.isswiftcode;
            $scope.isFirstCode = nv.isfirstcode;
            $scope.isLastcode = nv.islastcode;
            $scope.statusDisabled = false;
            $scope.patTeeth = new kendo.data.DataSource({
              data: patientOdontogramFactory.TeethDefinitions.Teeth,
            });
            ctrl.init();
            $timeout(function () {
              // trigger reset of provider-selector when called from chart buttons
              // this will reset serviceTransaction.ProviderUserId based on PreferredDentist/PreferredHygienist
              $scope.loadProviderSelector = true;

              angular.element('.surfCmpct button').removeClass('active');
              if (angular.element('select#teethMultiSelect')) {
                var multiselect = angular
                  .element('select#teethMultiSelect')
                  .data('kendoMultiSelect');
                if (
                  multiselect &&
                  (patientOdontogramFactory.selectedTeeth.length === 0 ||
                    $scope.invalidToothForCode === true)
                ) {
                  multiselect.value('');
                }
              }
            }, 100);
            // reset selected on surfaces and roots
            _.forEach($scope.roots, function (root) {
              root.selected = false;
            });
            _.forEach($scope.surfaces, function (surface) {
              surface.selected = false;
            });
            $scope.validateForm();
          }
        },
        true
      );
    }

    //#region auth

    //soar-clin-cpsvc-add: 2352
    //soar-clin-cpsvc-edit: 2353

    $scope.authAccess = patientServicesFactory.access();

    // if editing a service user must have authAccess.Edit
    if ($scope.mode === 'Service') {
      if (!$scope.authAccess.View) {
        toastrFactory.error(
          patSecurityService.generateMessage(AmfaKeys.SoarClinCpsvcView),
          'Not Authorized'
        );
        //event.preventDefault();
        $location.path('/');
      }
    }

    //#endregion

    $scope.isAreaMatching = function (area) {
      return $scope.area === area;
    };

    /**
     * getting the list of serviceCodes
     *
     * @returns {angular.IPromise<any>} Service codes
     */
    function getServices() {
      return referenceDataService
        .getData(referenceDataService.entityNames.serviceCodes)
        .then(function (serviceCodes) {
          patientOdontogramFactory.serviceCodes = serviceCodes;
          return serviceCodes;
        });
    }

    getServices();

    // used to set max date when edited service transaction
    // converts max date to timezone adjected date if maxDate is not null otherwise to null
    ctrl.setTimeZoneDate = function () {
      // convert the display date to actual transaction time zone date
      var locationTmp = _.find(ctrl.locations, {
        LocationId: $scope.serviceTransaction.LocationId,
      });
      var locationTimezone = locationTmp ? locationTmp.Timezone : '';

      // this date should be the timezone adjusted date for the maxDate
      $scope.timeZoneDate = null;
      if ($scope.maxDate !== null) {
        var displayDate = locationTimezone
          ? timeZoneFactory.ConvertDateTZString(
              $scope.maxDate,
              locationTimezone
            )
          : moment.utc($scope.maxDate).toDate();
        $scope.timeZoneDate = displayDate;
      }
    };

    // handle rules for setting max date
    // default for maxDate is null which will effectively allow any future date
    // if ServiceTransaction is being created from appointments or encounters the max date should be today
    // if ServiceTransaction.Status is Completed, Pending, Or Existing the max date should be today
    ctrl.setMaxDate = function () {
      var maxDate = null;
      if ($scope.passinfo === true) {
        maxDate = moment(new Date());
      }
      // if existing serviceTransaction is being edited, maxDate can't be more than today
      if (
        $scope.serviceTransaction &&
        (parseInt($scope.serviceTransaction.ServiceTransactionStatusId) === 4 ||
          parseInt($scope.serviceTransaction.ServiceTransactionStatusId) ===
            5 ||
          parseInt($scope.serviceTransaction.ServiceTransactionStatusId) === 6)
      ) {
        maxDate = moment(new Date());
      }
      return maxDate;
    };

    ctrl.resetDateEnteredOnStatusChange = function () {
      if (
        $scope.serviceTransaction &&
        (parseInt($scope.serviceTransaction.ServiceTransactionStatusId) === 4 ||
          parseInt($scope.serviceTransaction.ServiceTransactionStatusId) ===
            5 ||
          parseInt($scope.serviceTransaction.ServiceTransactionStatusId) === 6)
      ) {
        if (
          new Date($scope.serviceTransaction.$$DateEntered) >
          new Date($scope.timeZoneDate)
        ) {
          $scope.serviceTransaction.$$DateEntered = $scope.timeZoneDate;
        }
      }
    };

    var btnText =
      $scope.isSwiftCode && !$scope.islastcode ? 'Save & Next' : 'Save';
    $scope.btnText = localize.getLocalizedString(btnText);
    $scope.teethDefinitions = patientOdontogramFactory.TeethDefinitions;
    $scope.cdtCodegroups = patientOdontogramFactory.CdtCodeGroups;
    $scope.roots = $scope.teethDefinitions.Roots;
    $scope.patTeeth = new kendo.data.DataSource({
      data: patientOdontogramFactory.TeethDefinitions.Teeth,
    });
    $scope.timeZoneDate = undefined;
    $scope.maxDate = ctrl.setMaxDate();

    $scope.useMin = false;
    // if from appointments the dateselector is hidden and minDate is used for min and max date
    if ($scope.passinfo && $scope.$parent.$parent.appointmentDate) {
      $scope.maxDate = null;
      $scope.minDate = $scope.$parent.$parent.appointmentDate;
      $scope.useMin = true;
    }

    $scope.validDate = true;
    $scope.noProvider = false;
    $scope.noClaimsProvider = false;
    $scope.noLocation = false;
    $scope.personId = $routeParams.patientId;
    $scope.errorMessage = false;

    ctrl.success = function (serviceCode) {
      if (serviceCode) {
        $scope.selectedChrtBtn = serviceCode;
        $scope.originalCode = $scope.selectedChrtBtn.Code;
        $scope.area = serviceCode.AffectedAreaId;
        $scope.originalSmartCode = angular.copy(serviceCode);
        $scope.selectedCode = _.find($scope.cdtCodegroups, {
          CdtCode: serviceCode.CdtCodeName,
        });
        if ($scope.selectedCode) {
          var smartCodeGroupSelected = listHelper.findAllByPredicate(
            $scope.cdtCodegroups,
            function (item) {
              return item.CdtCode == $scope.selectedCode.CdtCode;
            }
          );
          $scope.getApplicableTeeth(smartCodeGroupSelected);
        }
        // special handling for some areas
        switch ($scope.area) {
          case 1:
            $scope.activeTeeth = [];
            break;
          case 3:
            var service = serviceCode;
            ctrl.appendKendoWindowTitle('', service);
            break;
          case 4:
            $scope.formIsValid = false;
            break;
        }

        if ($scope.mode === 'Service') {
          var deferred = $q.defer();

          $scope.currentServiceCode = _.cloneDeep(
            referenceDataService.setFeesByLocation(serviceCode)
          );
          // editing?
          if ($scope.isEdit) {
            ctrl.editServiceTransaction().then(function () {
              deferred.resolve();
            });
          } else {
            // create new
            $scope.showProviderSelector = true;
            ctrl
              .createServiceTransaction(null, true)
              .then(function (serviceTransaction) {
                $scope.serviceTransaction = serviceTransaction;
                ctrl.setActiveTeeth();
                deferred.resolve();
              });
          }

          deferred.promise.then(() => {
            $scope.loadProviders();
            $scope.setSmartCodeGroup();
          });
        }
      }
    };

    $scope.invalidToothForCode = false;
    ctrl.setActiveTeeth = function () {
      $scope.invalidToothForCode = false;
      var activeTeeth = [];
      if ($scope.serviceTransaction && $scope.serviceTransaction.Tooth) {
        activeTeeth.push($scope.serviceTransaction.Tooth);
      }
      if ($scope.area !== 1 && !$scope.passinfo) {
        _.forEach(patientOdontogramFactory.selectedTeeth, function (tooth) {
          var item = _.find($scope.patTeeth.options.data, {
            USNumber: _.toString(tooth),
          });
          if (!_.isEmpty(item)) {
            activeTeeth.push(tooth);
            $scope.invalidToothForCode = false;
          } else if (activeTeeth.length === 0) {
            $scope.invalidToothForCode = true;
          }
        });
      }

      let oldActiveTeeth = $scope.activeTeeth;
      $scope.activeTeeth = activeTeeth;

      // workaround for angular change tracking to make sure the watch fires in certain scenarios
      if (activeTeeth.length > 0 && _.isEqual(oldActiveTeeth, activeTeeth)) {
        $timeout(function () {
          ctrl.activeTeethWatch($scope.activeTeeth, oldActiveTeeth);
        });
      }
    };

    $scope.getChartButton = function (buttonId) {
      if (!$scope.passinfo) {
        if ($scope.mode === 'Service') loadServiceCodeById(buttonId);
      } else {
        $rootScope.$broadcast('retreaveCurrentCode');
      }
    };

    var removeListenerCurrentcode = $rootScope.$on(
      'currentCode',
      function (event, codes) {
        $scope.serviceTransaction = null;

        if (
          codes &&
          $scope.$id === patientServicesFactory.ActiveToothCtrlsScopeId
        ) {
          $scope.serviceTransaction = codes;
          $scope.area = codes.AffectedAreaId;
          $scope.originalCode = codes.Code;
          // need to make the ProviderUserId to null
          // changing the location will keeping the previous ProviderUserId
          // if they have preferred provider, provider-selector will take care of that
          // 4/27/2020 Adding condition so that the provider list gets loaded when coming from the encounter and editing a service
          if (!$scope.passinfo) {
            $scope.serviceTransaction.ProviderUserId = null;
          } else {
            $scope.showProviderSelector = true;
          }

          $scope.selectedCode = _.find($scope.cdtCodegroups, {
            CdtCode: codes.CdtCodeName,
          });
          $scope.originalSmartCode = $scope.selectedCode;
          if ($scope.selectedCode) {
            var smartCodeGroupSelected = listHelper.findAllByPredicate(
              $scope.cdtCodegroups,
              function (item) {
                return item.CdtCode == $scope.selectedCode.CdtCode;
              }
            );
            $scope.getApplicableTeeth(smartCodeGroupSelected);
          }
          // special handling for some areas
          switch ($scope.area) {
            case 1:
              $scope.activeTeeth = [];
              break;
            case 3:
              ctrl.appendKendoWindowTitle('', codes);
              break;
            case 4:
              $scope.formIsValid = false;
              break;
          }
          if ($scope.mode === 'Service') {
            // need to get locationSpecificInfo
            referenceDataService
              .getData(referenceDataService.entityNames.serviceCodes)
              .then(function (serviceCodes) {
                if (!_.isEmpty(serviceCodes)) {
                  var serviceCode = _.find(serviceCodes, {
                    ServiceCodeId: codes.ServiceCodeId,
                  });
                  return setCurrentServiceCode(serviceCode);
                } else {
                  var service = _.find(ctrl.serviceCodes, {
                    ServiceCodeId: codes.ServiceCodeId,
                  });
                  if (!_.isNil(service)) {
                    return setCurrentServiceCode(service);
                  }
                }
                return $q.resolve();
              });
          }
        }
      }
    );

    /**
     * Set current service code.
     *
     * @param {*} serviceCode
     * @returns {angular.IPromise}
     */
    function setCurrentServiceCode(serviceCode) {
      var deferred = $q.defer();

      $scope.currentServiceCode = _.cloneDeep(
        referenceDataService.setFeesByLocation(serviceCode)
      );
      $scope.originalSmartCode = _.cloneDeep($scope.currentServiceCode);
      ctrl.resetFeeByLocation();
      // editing?
      if ($scope.isEdit) {
        ctrl.editServiceTransaction().then(() => deferred.resolve());
      } else {
        $scope.showProviderSelector = true;
        // create new
        ctrl.setActiveTeeth();
        deferred.resolve();
      }

      return deferred.promise.then(() => {
        $scope.loadProviders();
        $scope.setSmartCodeGroup();
      });
    }

    // get current kendo window handle
    ctrl.getCurrentKendoWindows = function () {
      var windowTitles = [];
      var elements = document.getElementsByClassName('k-window-title');
      angular.forEach(elements, function (element) {
        var titleElement = angular.element(element);
        windowTitles.push(titleElement[0]);
      });
      return windowTitles;
    };

    ctrl.init = function () {
      _.forEach($scope.roots, function (rt) {
        rt.selected = false;
      });
      $scope.originalCode = null;
      $scope.activeQuadrant = {};
      $scope.activeSurfaces = [];
      $scope.activeArch = {};

      if (_.isFunction($scope.getChartButton)) {
        $scope.getChartButton(patientOdontogramFactory.selectedChartButtonId);
      }

      ctrl.setToothData();
      ctrl.getServiceTransactionStatuses();
      if (!$scope.passinfo) {
        ctrl.getTreatmentPlanSummaries();
      }

      // need to load kendo-multi-select on another thread to keep from getting '$digest already in progress', the second time this controller is instantiated
      //$timeout(function () {
      //    $scope.loadKendoWidgets = true;
      //});

      $scope.patientInfo = patientValidationFactory.GetPatientData();
      // do not Check patient location when editing service.
      //Refer to this PBI# 287059
      //if (!$scope.isEdit) {
      //    $scope.checkPatientLocation();
      //}
      //else {
      $scope.serviceLocationMatch = true;
      $scope.patientLocationMatch = true;
      //}

      // get a list of current kendo windows
      $scope.windowTitles = ctrl.getCurrentKendoWindows();

      // 493849 - assigning the preferred provider to the selected provider dropdown instead of the provider assigned to the appointment
      if ($scope.serviceTransaction && $scope.patientInfo) {
        if ($scope.serviceTransaction.UsuallyPerformedByProviderTypeId) {
          if (
            $scope.serviceTransaction.UsuallyPerformedByProviderTypeId == 1 &&
            $scope.patientInfo.PreferredDentist
          ) {
            // 1 = Dentist
            $scope.serviceTransaction.ProviderUserId =
              $scope.patientInfo.PreferredDentist;
          } else if (
            $scope.serviceTransaction.UsuallyPerformedByProviderTypeId == 2
          ) {
            // 2 = Hygienist
            $scope.serviceTransaction.ProviderUserId =
              $scope.patientInfo.PreferredHygienist;
          }
        }
      }
    };

    // set the fee for the service transaction
    // NOTE this is outside of the scope of this bug but we should move calculations to a factory or utility class
    // to standardize calculations
    /**
     *
     * @param {*} serviceCodeId
     * @returns {angular.IPromise<number>}
     */
    ctrl.setFeeForServiceTransaction = function (serviceCodeId) {
      var deferred = $q.defer();

      let tempServiceCode = null;
      if ($scope.currentServiceCode.ServiceCodeId == serviceCodeId) {
        tempServiceCode = $scope.currentServiceCode;
        deferred.resolve();
      } else if (
        $scope.nextSmartCode &&
        $scope.nextSmartCode.ServiceCodeId == serviceCodeId
      ) {
        tempServiceCode = $scope.nextSmartCode;
        deferred.resolve();
      } else {
        referenceDataService
          .getData(referenceDataService.entityNames.serviceCodes)
          .then(function (serviceCodes) {
            if (!_.isEmpty(serviceCodes)) {
              tempServiceCode = _.find(serviceCodes, {
                ServiceCodeId: serviceCodeId,
              });
            }
            deferred.resolve();
          });
      }

      return deferred.promise.then(() => {
        var fee = 0;
        // if this is an existing service or 'Referred' the fee is always 0
        if (
          $scope.serviceTransaction &&
          ($scope.existingService || $scope.referredService)
        ) {
          return fee;
        }
        // if we have a valid fee (even 0), don't overwrite it
        // If not, use the correct fee based on location when instancing the service transaction
        if (
          $scope.serviceTransaction &&
          $scope.originalServiceFee >= 0 &&
          $scope.originalServiceFee !== null
        ) {
          fee = $scope.originalServiceFee;
          if (tempServiceCode && tempServiceCode.AffectedAreaId === 3) {
            if (
              $scope.nextSmartCode &&
              $scope.nextSmartCode.$$locationFee == $scope.originalServiceFee
            ) {
              if (
                $scope.nextSmartCode.ServiceCodeId !=
                tempServiceCode.ServiceCodeId
              ) {
                //Root smart code, find the correct $$locationFee
                //The service code we passed in doesn't match the current service code...
                //Go get the service code that we passed in
                fee = tempServiceCode.$$locationFee;
              } else {
                fee = $scope.nextSmartCode.$$locationFee;
              }
            } else if (
              $scope.originalServiceFee ==
              $scope.currentServiceCode.$$locationFee
            ) {
              if (
                $scope.currentServiceCode.ServiceCodeId !=
                tempServiceCode.ServiceCodeId
              ) {
                //Root smart code, find the correct $$locationFee
                //The service code we passed in doesn't match the current service code...
                //Go get the service code that we passed in

                fee = tempServiceCode.$$locationFee;
              } else {
                fee = $scope.currentServiceCode.$$locationFee;
              }
            }
          }
        } else {
          if (tempServiceCode) {
            if (
              $scope.nextSmartCode &&
              $scope.nextSmartCode.ServiceCodeId ==
                tempServiceCode.ServiceCodeId
            ) {
              fee = $scope.nextSmartCode.$$locationFee;
            } else if (
              $scope.currentServiceCode.ServiceCodeId ==
              tempServiceCode.ServiceCodeId
            ) {
              //Root smart code, find the correct $$locationFee
              fee = $scope.currentServiceCode.$$locationFee;
            } else {
              fee = tempServiceCode.$$locationFee;
            }
          } else {
            if ($scope.nextSmartCode && $scope.nextSmartCode.$$locationFee) {
              fee = $scope.nextSmartCode.$$locationFee;
            } else {
              fee = $scope.currentServiceCode.$$locationFee;
            }
          }
        }
        return fee;
      });
    };

    // catch all to prevent overwriting of fee when an existing service
    // if this is an existing service the fee is always 0
    // TODO there should be one method to set the fee in all situations to avoid this kindof override
    ctrl.setFeeForExistingService = function (serviceTransaction) {
      if (
        serviceTransaction &&
        ($scope.existingService || $scope.referredService)
      ) {
        serviceTransaction.Fee = 0;
      }
    };

    /**
     * Create service transaction.
     *
     * @param {*} tooth
     * @param {*} blank
     * @returns {angular.IPromise<any>}
     */
    ctrl.createServiceTransaction = function (tooth, blank) {
      if ($scope.originalServiceFee == null) {
        $scope.originalServiceFee = $scope.serviceTransaction.Fee;
      }
      var toothNumber = '';
      var accountMemberId = '';
      var serviceCodeId = ctrl.getServiceCodeId(tooth);

      //Passing in the serviceCodeId because the serviceCode might not be the $scope.currentServiceCode
      return ctrl
        .setFeeForServiceTransaction(serviceCodeId)
        .then(function (fee) {
          var deferred = $q.defer();

          if (tooth && tooth.USNumber) {
            toothNumber = tooth.USNumber;
          }
          if (
            $scope.patientInfo &&
            $scope.patientInfo.PersonAccount &&
            $scope.patientInfo.PersonAccount.PersonAccountMember &&
            $scope.patientInfo.PersonAccount.PersonAccountMember.AccountMemberId
          ) {
            accountMemberId =
              $scope.patientInfo.PersonAccount.PersonAccountMember
                .AccountMemberId;
          } else {
            accountMemberId = null;
          }
          var date = blank
            ? moment().format('MM/DD/YYYY')
            : $scope.serviceTransaction.DateEntered;
          var locationId = ctrl.getLocationId();
          var treatmentPlanId = $scope.treatmentPlanId || null;
          treatmentPlanId =
            $scope.treatmentPlanId === 'null' ||
            angular.isUndefined($scope.treatmentPlanId)
              ? null
              : $scope.treatmentPlanId;

          if ($scope.passinfo) {
            ctrl
              .setValuesOnServiceTransactionForNewCode(serviceCodeId)
              .then(() => {
                $scope.serviceTransaction.AccountMemberId = accountMemberId;
                $scope.serviceTransaction.DateEntered = $filter('setDateTime')(
                  date
                );
                $scope.serviceTransaction.Fee = fee;
                $scope.serviceTransaction.LocationId = locationId;
                $scope.serviceTransaction.Roots = blank
                  ? null
                  : $scope.getrootsForTooth(tooth);
                $scope.serviceTransaction.ServiceCodeId = serviceCodeId;
                $scope.serviceTransaction.Surface = blank
                  ? null
                  : $scope.getselectedSurfaces(tooth);
                $scope.serviceTransaction.Tooth = blank ? null : toothNumber;
                $scope.serviceTransaction.TransactionTypeId = 1;
                ctrl.setFeeForExistingService($scope.serviceTransaction);

                // if the appointmentId is in the url set the AppointmentId on the serviceTransaction.
                if (
                  $routeParams.appt !== null &&
                  $routeParams.appt !== undefined
                ) {
                  $scope.serviceTransaction.AppointmentId = $routeParams.appt;
                }

                deferred.resolve(angular.copy($scope.serviceTransaction));
              });
          } else {
            // NOTE bug 365552
            // the fee has been calculated by ctrl.setFeeForServiceTransaction and doesn't need to be reset again
            var serviceTransaction = {
              AccountMemberId: accountMemberId,
              $$DateEntered:
                date === undefined
                  ? $scope.serviceTransaction.DateEntered
                  : $filter('setDateTime')(date),
              DateEntered: $filter('setDateTime')(date),
              Fee: fee,
              LocationId: locationId,
              ProviderUserId: blank
                ? null
                : $scope.serviceTransaction.ProviderUserId,
              Roots: blank ? null : $scope.getrootsForTooth(tooth),
              ServiceCodeId: serviceCodeId,
              ServiceTransactionId: null,
              ServiceTransactionStatusId: blank
                ? 1
                : $scope.serviceTransaction.ServiceTransactionStatusId,
              Surface: blank ? null : $scope.getselectedSurfaces(tooth),
              Tooth: blank ? null : toothNumber,
              TransactionTypeId: 1,
              TreatmentPlanId: blank
                ? treatmentPlanId
                : $scope.serviceTransaction.TreatmentPlanId,
              ObjectState: blank
                ? saveStates.Add
                : $scope.serviceTransaction.ObjectState,
              UsuallyPerformedByProviderTypeId:
                $scope.selectedChrtBtn.UsuallyPerformedByProviderTypeId,
            };
            ctrl.setFeeForExistingService(serviceTransaction);

            // if the appointmentId is in the url set the AppointmentId on the serviceTransaction.
            if ($routeParams.appt !== null && $routeParams.appt !== undefined) {
              serviceTransaction.AppointmentId = $routeParams.appt;
            }

            deferred.resolve(serviceTransaction);
          }

          return deferred.promise;
        });
    };

    ctrl.getServiceCodeId = function (tooth) {
      if (tooth != null) {
        if ($scope.area === 4 || $scope.area === 5) {
          return $scope.serviceTransaction &&
            $scope.serviceTransaction.ServiceCodeId
            ? $scope.serviceTransaction.ServiceCodeId
            : $scope.selectedChrtBtn.ServiceCodeId;
        } else if ($scope.area === 3) {
          //This is a Root code and we might have multiple teeth selected
          //We'll need to assume that each tooth that comes through here might be a different service code
          //Find the correct smart code
          return ctrl.getRootSmartCodeForTooth(tooth);
        } else {
          return $scope.selectedChrtBtn
            ? $scope.selectedChrtBtn.ServiceCodeId
            : $scope.serviceTransaction.ServiceCodeId;
        }
      } else {
        return $scope.selectedChrtBtn
          ? $scope.selectedChrtBtn.ServiceCodeId
          : $scope.serviceTransaction.ServiceCodeId;
      }
    };

    $scope.getApplicableTeeth = function (smartCodeGroup) {
      if (smartCodeGroup[0].AllowedTeeth.indexOf('All') == -1) {
        var applicableTeeth = [];
        _.forEach(smartCodeGroup, function (smartCode) {
          _.forEach(smartCode.AllowedTeeth, function (tooth) {
            if (
              _.isUndefined(
                _.find(applicableTeeth, { USNumber: _.toString(tooth) })
              )
            ) {
              var toothObj = _.find($scope.patTeeth.options.data, {
                USNumber: _.toString(tooth),
              });
              if (toothObj) applicableTeeth.push(toothObj);
            }
          });
        });

        $scope.patTeeth = new kendo.data.DataSource({
          data: $filter('orderBy')(applicableTeeth, 'ToothId'),
        });
      }
    };

    // we only need to load the filterServiceTransactionStatuses the first time the control is instanced
    // if we have a filtered list, don't do this again.
    // NOTE, getting the list the second time causes the dropdown to display incorrectly (ref 336870)
    ctrl.getServiceTransactionStatuses = function () {
      if (!_.isEmpty($scope.filteredServiceTransactionStatuses)) {
        if (
          $scope.isNewTreatmentPlan === 'true' ||
          $scope.isEditTreatmentPlan === 'true'
        ) {
          ctrl.filterServiceTransactionStatusesForTxPlan();
        } else {
          ctrl.filterServiceTransactionStatuses();
        }
      }
      staticData.ServiceTransactionStatuses().then(function (res) {
        if (res && res.Value) {
          ctrl.serviceTransactionStatuses = res.Value;
          // if we can modify the status, the only 2 options should be proposed,existing
          if (
            $scope.isNewTreatmentPlan === 'true' ||
            $scope.isEditTreatmentPlan === 'true'
          ) {
            ctrl.filterServiceTransactionStatusesForTxPlan();
          } else {
            ctrl.filterServiceTransactionStatuses();
          }
        }
      });
    };

    $scope.filteredServiceTransactionStatuses = [];
    ctrl.filterServiceTransactionStatuses = function () {
      $scope.filteredServiceTransactionStatuses = _.filter(
        ctrl.serviceTransactionStatuses,
        function (status) {
          return (
            status.Id === 1 ||
            status.Id === 2 ||
            status.Id === 3 ||
            status.Id === 7 ||
            status.Id === 8 ||
            (status.Id === 6 &&
              ctrl.canSetStatusToExisting($scope.serviceTransaction))
          );
        }
      );
      $scope.filteredServiceTransactionStatuses = _.orderBy(
        $scope.filteredServiceTransactionStatuses,
        ['Name'],
        ['asc']
      );
    };
    ctrl.filterServiceTransactionStatusesForTxPlan = function () {
      $scope.filteredServiceTransactionStatuses = _.filter(
        ctrl.serviceTransactionStatuses,
        function (status) {
          return (
            status.Id === 1 ||
            status.Id === 2 ||
            status.Id === 3 ||
            status.Id === 7 ||
            status.Id === 8
          );
        }
      );
      $scope.filteredServiceTransactionStatuses = _.orderBy(
        $scope.filteredServiceTransactionStatuses,
        ['Name'],
        ['asc']
      );
    };

    ctrl.canSetStatusToExisting = function (service) {
      return (
        _.isNil(service) ||
        _.isNil(service.EncounterId) ||
        service.ServiceTransactionStatusId === 6
      );
    };

    //#region treatment plan headers get

    // success callback for get treatment plan headers
    ctrl.getTreatmentPlanSummariesSuccess = function (res) {
      if (res && res.Value) {
        $scope.treatmentPlanSummaries = res.Value;
        _.forEach(
          $scope.treatmentPlanSummaries,
          function (treatmentPlanSummary) {
            ctrl.buildTreatmentPlanDescription(treatmentPlanSummary);
          }
        );
        // add placeholder entry for new TP to front of list, empty GUID, TreatmentPlanDescription to match prompt from ACs, PersonId
        $scope.treatmentPlanSummaries.push({
          TreatmentPlanDescription: localize.getLocalizedString(
            'Add to new treatment plan'
          ),
          TreatmentPlanId: '00000000-0000-0000-0000-000000000000',
          PersonId: $scope.personId,
        });
      }
    };

    // failure callback for gettreatment plan headers
    ctrl.getTreatmentPlanSummariesFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['Treatment Plans']
        ),
        localize.getLocalizedString('Error')
      );
    };

    //getting stages for seleted treatment plan
    ctrl.getTreatmentplanStages = function (planId) {
      var plans = treatmentPlansFactory.ExistingTreatmentPlans;
      var Stages = [];
      _.forEach(plans, function (txplan) {
        if (txplan.TreatmentPlanHeader.TreatmentPlanId === planId) {
          Stages = treatmentPlansFactory.GetPlanStages();
          var stage = [];
          for (var i = 0; i < Stages.length; i++) {
            if (!_.isNil(Stages[i].stageno)) {
              stage.push({
                stageno: i + 1,
                stagedesc: i + 1,
              });
            }
          }
          Stages = stage;
        }
      });
      if (Stages.length === 0) {
        Stages.push({
          stageno: 1,
          stagedesc: 1,
        });
      } else {
        Stages.push({
          stageno: Stages.length + 1,
          stagedesc: 'New Stage' + ' ' + '(' + (Stages.length + 1) + ')',
        });
      }
      ctrl.setStageSelected(Stages);
      // order planStages
      $scope.planStages = _.cloneDeep($filter('orderBy')(Stages, 'stageno'));
    };

    // set $scope.stageSelected.number based on passed stageNumber and stages
    ctrl.setStageSelected = function (stages) {
      var stageNumber = parseInt($scope.stageNumber);
      var existsInStages = stages.find(
        ({ stageno }) => stageno === stageNumber
      );
      if ($scope.treatmentPlanId && stageNumber && existsInStages) {
        $scope.stageSelected.number = stageNumber;
      } else {
        $scope.stageSelected.number = stages[0].stageno;
      }
    };

    // getting treatment plan headers for patient
    ctrl.getTreatmentPlanSummaries = function () {
      if (!_.isNil($scope.personId)) {
        patientServices.TreatmentPlans.treatmentPlanSummariesForAddService(
          { Id: $scope.personId },
          ctrl.getTreatmentPlanSummariesSuccess,
          ctrl.getTreatmentPlanSummariesFailure
        );
      }
    };

    ctrl.buildTreatmentPlanDescription = function (treatmentPlanHeaderSummary) {
      var displayName = treatmentPlanHeaderSummary.TreatmentPlanName + ' | ';
      if (treatmentPlanHeaderSummary.ServicesCount) {
        displayName =
          treatmentPlanHeaderSummary.ServicesCount === 1
            ? displayName +
              treatmentPlanHeaderSummary.ServicesCount +
              ' Service '
            : displayName +
              treatmentPlanHeaderSummary.ServicesCount +
              ' Services ';
      }
      var formattedFees = '($0.00)';
      if (treatmentPlanHeaderSummary.ServicesFees === 0) {
        displayName = displayName + formattedFees;
      } else {
        formattedFees = $filter('currency')(
          treatmentPlanHeaderSummary.ServicesFees
        );
        displayName = displayName + '(' + formattedFees + ')';
      }
      treatmentPlanHeaderSummary.TreatmentPlanDescription = displayName;
    };

    $scope.$watch(
      'roots',
      function (nv, ov) {
        if (nv && ov && nv !== ov && nv.length === ov.length) {
          $timeout(function () {
            ctrl.captureToothInfo($scope.serviceTransaction);
          }, 100);
        }
        $scope.validateForm();
      },
      true
    );
    //#endregion

    $scope.validateForm = function () {
      $scope.formIsValid = true;

      if (
        $scope.activeTeeth &&
        $scope.activeTeeth.length === 0 &&
        $scope.area !== '' &&
        $scope.area !== 1
      ) {
        $scope.formIsValid = false;
        return;
      }
      if ($scope.area === 4) {
        var index = listHelper.findIndexByFieldValue(
          $scope.surfaces,
          'selected',
          true
        );
        if (index === -1) {
          $scope.formIsValid = false;
          return;
        }
      }
      if ($scope.area === 3) {
        index = listHelper.findIndexByFieldValue(
          $scope.roots,
          'selected',
          true
        );
        if (index === -1) {
          $scope.formIsValid = false;
          return;
        }
      }
      if (!$scope.validDate) {
        $scope.formIsValid = false;
        return;
      }
      if (
        $scope.mode === 'Service' &&
        (!$scope.serviceTransaction ||
          ($scope.serviceTransaction.ProviderUserId == null &&
            $scope.serviceTransaction.ServiceTransactionStatusId != 6) ||
          $scope.serviceTransaction.ProviderUserId == '' ||
          angular.isUndefined($scope.serviceTransaction.ProviderUserId))
      ) {
        $scope.formIsValid = false;
      }
      if (
        $scope.mode === 'Service' &&
        !$scope.passinfo &&
        (!$scope.serviceTransaction ||
          ($scope.serviceTransaction.LocationId == null &&
            $scope.serviceTransaction.ServiceTransactionStatusId != 6) ||
          $scope.serviceTransaction.LocationId == '' ||
          angular.isUndefined($scope.serviceTransaction.LocationId))
      ) {
        $scope.formIsValid = false;
      }
      if ($scope.checkData && _.isUndefined($scope.editMode)) {
        $scope.dataHasChanged = true;
      }
      if (
        !(
          _.isNull($scope.dataHasChanged) ||
          _.isUndefined($scope.dataHasChanged)
        ) &&
        !$scope.dataHasChanged
      ) {
        $scope.formIsValid = false;
      }
    };

    $scope.getrootsForTooth = function (tooth) {
      var rootsAvailable = '';
      if (
        $scope.activeTeeth &&
        $scope.activeTeeth.length !== 0 &&
        $scope.area === 3
      ) {
        if (tooth.USNumber && tooth.RootAbbreviations) {
          _.forEach($scope.roots, function (root) {
            var contains =
              tooth.RootAbbreviations.indexOf(root.RootAbbreviation) > -1;
            // if there is more than one tooth in $scope.activeTeeth, we need to set all roots to selected because selector will not be visible
            if ($scope.activeTeeth && $scope.activeTeeth.length > 1) {
              root.selected = true;
            }
            if (contains && root.selected) {
              rootsAvailable = rootsAvailable + root.RootAbbreviation + ',';
            }
          });
        }
      }
      rootsAvailable = rootsAvailable.substr(0, rootsAvailable.length - 1);
      return rootsAvailable;
    };

    $scope.getselectedSurfaces = function (tooth) {
      var selectedSurfaces = '';
      if (
        $scope.activeTeeth &&
        $scope.activeTeeth.length !== 0 &&
        $scope.area === 4
      ) {
        if (tooth.USNumber && tooth.SummarySurfaceAbbreviations) {
          _.forEach($scope.surfaces, function (surface) {
            var surfaces = surface.SurfaceAbbreviation.split('/');
            _.forEach(surfaces, function (surf) {
              var contains =
                tooth.SummarySurfaceAbbreviations.indexOf(surf) > -1;
              if (contains && surface.selected) {
                selectedSurfaces = selectedSurfaces + surf + ',';
              }
            });
          });
        }
      }
      selectedSurfaces = selectedSurfaces.substr(
        0,
        selectedSurfaces.length - 1
      );
      return selectedSurfaces;
    };

    ctrl.getToothDetails = function (tooth) {
      return listHelper.findItemByFieldValue(
        angular.copy(patientOdontogramFactory.TeethDefinitions.Teeth),
        'USNumber',
        tooth
      );
    };

    $scope.detailedActiveTeeth = [];

    ctrl.setToothData = function () {
      if ($scope.activeTeeth && !_.isArray($scope.activeTeeth)) {
        $scope.activeTeeth = [$scope.activeTeeth];
      }
      _.forEach($scope.activeTeeth, function (tooth) {
        var selectedTooth = ctrl.getToothDetails(tooth);
        $scope.detailedActiveTeeth.push(selectedTooth);
      });
      // if there is more than one tooth in $scope.activeTeeth, we need to set all roots to selected because selector will not be visible
      if (
        $scope.area === 3 &&
        $scope.activeTeeth &&
        ($scope.activeTeeth.length > 1 ||
          ($scope.activeTeeth.length === 1 &&
            _.isEmpty($scope.serviceTransaction.ServiceTransactionId)))
      ) {
        var roots = '';
        _.forEach($scope.roots, function (root) {
          roots = roots.concat(root.RootAbbreviation + ',');
        });
        ctrl.setActiveRoots(3, roots);
      }
    };

    // if affectedArea is 4 activeSurfaces refers to the selected surfaces for the selected tooth
    ctrl.getNextSmartCode = function (activeSurfaces) {
      // prevent this code from processing if the modal is closing
      if ($scope.modalClosing !== true) {
        var previousSmartCode = $scope.nextSmartCode.ServiceCodeId
          ? angular.copy($scope.nextSmartCode)
          : angular.copy($scope.currentServiceCode);
        var serviceStatus =
          $scope.serviceTransaction &&
          $scope.serviceTransaction.ServiceTransactionStatusId
            ? $scope.serviceTransaction.ServiceTransactionStatusId.toString()
            : '';
        if (serviceStatus !== '4') {
          if (
            activeSurfaces.length > 0 &&
            $scope.currentServiceCode.UseSmartCodes
          ) {
            var nextSmartCode = proposedServiceFactory.GetSmartCode(
              activeSurfaces,
              $scope.currentServiceCode
            );
            var match = $scope.smartCodeGroup.filter(
              $scope.checkSmartCodeGroup,
              nextSmartCode
            );

            if (
              nextSmartCode &&
              nextSmartCode.CdtCode !== $scope.currentServiceCode.CdtCodeName
            ) {
              // Check to ensure the next code is in the current smart code group
              if (match.length > 0) {
                $scope.nextSmartCode = nextSmartCode;
              } else {
                $scope.nextSmartCode = $scope.originalSmartCode;
              }
            } else {
              $scope.nextSmartCode = $scope.originalSmartCode;
            }
            var skipFee =
              $scope.nextSmartCode &&
              previousSmartCode &&
              $scope.nextSmartCode.ServiceCodeId ==
                previousSmartCode.ServiceCodeId;
            ctrl.resetServiceTransaction($scope.nextSmartCode, skipFee);
            $scope.currentServiceCode.Description =
              $scope.nextSmartCode.Description;
            ctrl.appendKendoWindowTitle(
              previousSmartCode,
              $scope.nextSmartCode
            );
          } else if (activeSurfaces.length == 0 && $scope.originalSmartCode) {
            ctrl.resetServiceTransaction($scope.originalSmartCode);
            $scope.currentServiceCode.Description =
              $scope.originalSmartCode.Description;
            $scope.nextSmartCode = $scope.originalSmartCode;
            ctrl.appendKendoWindowTitle(
              previousSmartCode,
              $scope.nextSmartCode
            );
          }
        }
      }
    };

    // Check the current smart code group for the next smart code
    $scope.checkSmartCodeGroup = function (value) {
      return this && value == this.ServiceCodeId;
    };

    // only set formIsValid if serviceTransaction has changed
    $scope.$watch(
      'serviceTransaction',
      function (nv, ov) {
        if (_.isEqual(nv, ov)) {
          return;
        }
        if (nv && ov && nv !== ov) {
          ctrl.setDataHasChanged();
          $scope.validateForm();
          if (nv.TreatmentPlanId !== ov.TreatmentPlanId) {
            $timeout(function () {
              ctrl.getTreatmentplanStages(nv.TreatmentPlanId);
            });
          }
        }
      },
      true
    );

    $scope.$watch('validDate', function () {
      $scope.validateForm();
    });

    ctrl.activeTeethWatch = function (nv, ov) {
      // Re-roll smart code
      if (
        $scope.currentServiceCode &&
        $scope.currentServiceCode.UseSmartCodes &&
        $scope.currentServiceCode.UseCodeForRangeOfTeeth
      ) {
        $scope.getRoTSmartCode();
      }

      // handles smart codes if this code has an affected area of 3
      ctrl.checkSmartCodesForRoots($scope.activeTeeth);

      // special handling for range of teeth because in some instances they are split in the rot directive
      if (
        $scope.currentServiceCode &&
        $scope.currentServiceCode.UseCodeForRangeOfTeeth === true &&
        nv &&
        nv.length > 1 &&
        ov &&
        ov.length === 1 &&
        nv.length !== ov.length
      ) {
        ov = ov[0].split(',');

        if (
          $scope.originalActiveTeeth &&
          $scope.originalActiveTeeth.length === 0 &&
          $scope.originalActiveTeeth != null
        ) {
          $scope.originalActiveTeeth = angular.copy(ov);
        }
      }
      if (
        nv &&
        ov &&
        nv.toString() !== ov.toString() &&
        nv.length > 0 &&
        nv.toString() !== $scope.originalActiveTeeth.toString()
      ) {
        $scope.dataHasChanged = true;
      } else if (
        $scope.originalActiveTeeth &&
        nv &&
        nv.toString() === $scope.originalActiveTeeth.toString()
      ) {
        $scope.dataHasChanged = false;
      }
      if (nv) {
        $scope.detailedActiveTeeth.length = 0;

        ctrl.setToothData();
      }
      $scope.validateForm();

      ctrl.checkUserLocationAssignment();
    };

    $scope.$watch('activeTeeth', ctrl.activeTeethWatch, true);

    $scope.$watch(
      'serviceTransaction.TreatmentPlanId',
      function (nv) {
        ctrl.setLocationDisabled();
        if (!_.isEmpty(nv)) {
          $timeout(function () {
            ctrl.getTreatmentplanStages(nv);
          });
        } else if (nv === '') {
          $scope.planStages = [{ stageno: 1, stagedesc: 1 }];
          $scope.stageSelected.number = null;
        }
      },
      true
    );

    $scope.$watch('serviceTransaction.ProviderUserId', function (nv) {
      if ($scope.existingService) {
        $scope.serviceTransaction.ProviderUserId = null;
      }

      $scope.validateForm();
    });

    ctrl.serviceTransactionStatusIdChanged = function (nv, ov) {
      if (nv == '') {
        $scope.serviceTransaction.ServiceTransactionStatusId = 1;
      }

      if (!_.isNil($scope.serviceTransaction)) {
        if ($scope.serviceTransaction.Fee > 0) {
          ctrl.orginalValue = $scope.serviceTransaction.Fee;
        }
        //used for smart codes
        // for proposed or Accepted, when the fee is 0 we need to change the originalValue
        if (
          (ov === 1 || ov === 7 || ov === '1' || ov === '7') &&
          $scope.serviceTransaction.Fee === 0
        ) {
          ctrl.orginalValue = 0;
        }
      }
      if (ctrl.isload === true) {
        if (!_.isNil($scope.serviceTransaction)) {
          ctrl.dateEntered = $scope.serviceTransaction.DateEntered;
          ctrl.isload = false;
        }
      }
      $scope.existingService = nv == 6;
      // 2 for referred and 8 -> Referredcompleted
      $scope.referredService = nv == 2 || nv == 8;
      if ($scope.existingService || $scope.referredService) {
        if (!_.isNil(ov) && nv != ov) {
          ctrl.saveTreatmentPlanId = $scope.serviceTransaction.TreatmentPlanId;
        }
        $scope.serviceTransaction.Fee = 0;
        $scope.serviceTransaction.Discount = 0;

        if ($scope.existingService) {
          $scope.serviceTransaction.ProviderUserId = null;
          $scope.serviceTransaction.TreatmentPlanId = null;
        }
      } else {
        if (!_.isNil($scope.serviceTransaction)) {
          ctrl.savedFee =
            $scope.serviceTransaction.Fee === 0
              ? $scope.serviceTransactionFeeBackUp
              : ctrl.orginalValue;
        }
        if (
          !_.isNil(ctrl.orginalValue) &&
          $scope.serviceTransaction.Fee !== 0
        ) {
          $scope.serviceTransaction.Fee = ctrl.orginalValue;
          ctrl.saveTreatmentPlanId = $scope.serviceTransaction.TreatmentPlanId;
        } else {
          if (!_.isNil($scope.serviceTransaction)) {
            // if it is smartcode we need take the savedFee
            $scope.serviceTransaction.Fee =
              $scope.currentServiceCode == undefined
                ? 0
                : $scope.currentServiceCode.UseSmartCodes === true
                ? ctrl.savedFee
                : $scope.currentServiceCode.$$locationFee;
          }
        }
      }
      // TODO check reasoning for this
      if (!_.isNil($scope.serviceTransaction)) {
        if (nv == 8) {
          $scope.serviceTransaction.DateEntered = ctrl.dateEntered;
        }
      }

      if (!_.isNil(nv)) {
        $scope.maxDate = ctrl.setMaxDate();
        ctrl.setTimeZoneDate();
        ctrl.resetDateEnteredOnStatusChange();
      }
      $scope.validateForm();
    };

    $scope.$watch('serviceTransaction.ServiceTransactionStatusId', (nv, ov) => {
      return ctrl.serviceTransactionStatusIdChanged(nv, ov);
    });

    $scope.$watch('activeSurfaces', function (nv) {
      if (nv) {
        if (nv.length !== 0) {
          $scope.dataHasChanged = true;
          if (
            $scope.serviceTransaction.ProviderUserId != '' &&
            $scope.serviceTransaction.ProviderUserId != null &&
            $scope.activeTeeth &&
            $scope.activeTeeth.length >= 1
          ) {
            $scope.formIsValid = true;
          }
        }
        if (
          nv.length > 0 &&
          $scope.currentServiceCode &&
          $scope.currentServiceCode.UseSmartCodes &&
          $scope.currentServiceCode.AffectedAreaId !== 3
        ) {
          ctrl.getNextSmartCode(nv);
          $scope.validateForm();
        }
      }
      if ($scope.errorMessage && $scope.activeSurfaces.length > 1) {
        $scope.errorMessage = false;
      }
    });

    $scope.teethSelectOptions = {
      placeholder: 'Select teeth...',
      dataSource: $scope.patTeeth,
      dataTextField: 'USNumber',
      dataValueField: 'USNumber',
      valuePrimitive: true,
      enable: $scope.allowEditing,
      autoBind: true,
    };

    // get a list of teeth definitions which includes the summary surfaces info and root info
    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        $scope.teethDefinitions = res.Value;
      });
    };

    //#region service transaction(s) crud

    /**
     * Save service transaction.
     *
     * @returns {angular.IPromise}
     */
    $scope.saveServiceTransaction = function () {
      var deferred = $q.defer();

      $scope.validateForm();
      $scope.saving = true;

      if (
        $scope.formIsValid &&
        ($scope.existingService ||
          ($scope.serviceTransaction.ProviderUserId !== '' &&
            $scope.serviceTransaction.ProviderUserId != null &&
            (!$scope.isFromAccountSummary ||
              ($scope.serviceTransaction.ProviderOnClaimsId != '' &&
                $scope.serviceTransaction.ProviderOnClaimsId != null))))
      ) {
        ctrl.checkDateEntered();
        if ($scope.editMode) {
          ctrl.updateServiceTransaction().then(() => deferred.resolve());
        } else {
          if (
            !_.isUndefined($scope.serviceTransaction.ProviderUserId) ||
            $scope.existingService
          ) {
            var params = {
              Id: $scope.personId,
            };
            // set object state
            $scope.serviceTransaction.ObjectState = $scope.editMode
              ? saveStates.Update
              : saveStates.Add;
            if (
              $scope.nextSmartCode &&
              $scope.nextSmartCode.ServiceCodeId &&
              $scope.nextSmartCode.ServiceCodeId != null
            ) {
              $scope.serviceTransaction.ServiceCodeId = $scope.nextSmartCode
                .ServiceCodeId
                ? $scope.nextSmartCode.ServiceCodeId
                : $scope.serviceTransaction.ServiceCodeId;
            } else {
              $scope.serviceTransaction.ServiceCodeId = $scope.selectedChrtBtn
                ? $scope.selectedChrtBtn.ServiceCodeId
                : $scope.serviceTransaction.ServiceCodeId;
            }

            // building a temporary list of service transaction dtos
            var serviceTransactionsPromises = [];
            var chrtBtn = $scope.selectedChrtBtn
              ? $scope.selectedChrtBtn
              : $scope.serviceTransaction;

            referenceDataService
              .getData(referenceDataService.entityNames.serviceCodes)
              .then(function (serviceCodes) {
                if ($scope.activeTeeth.length > 0) {
                  if (_.isUndefined(chrtBtn.UseCodeForRangeOfTeeth)) {
                    var srvCode = _.find(serviceCodes, {
                      ServiceCodeId: chrtBtn.ServiceCodeId,
                    });
                    if (srvCode) {
                      chrtBtn.UseCodeForRangeOfTeeth =
                        srvCode.UseCodeForRangeOfTeeth;
                    }
                  }
                  if (chrtBtn.UseCodeForRangeOfTeeth === true) {
                    var toothItem = { USNumber: $scope.activeTeeth.join(',') };
                    serviceTransactionsPromises.push(
                      ctrl.createServiceTransaction(toothItem, false)
                    );
                  } else {
                    _.forEach($scope.activeTeeth, function (tooth) {
                      var toothItem = ctrl.getToothDetails(tooth);
                      // supporting range of teeth
                      if (!toothItem && tooth.indexOf('-') !== -1) {
                        toothItem = { USNumber: tooth };
                      }
                      serviceTransactionsPromises.push(
                        ctrl.createServiceTransaction(toothItem, false)
                      );
                    });
                  }
                } else {
                  serviceTransactionsPromises.push(
                    ctrl.createServiceTransaction(null, false)
                  );
                }

                $q.all(serviceTransactionsPromises).then(
                  serviceTransactions => {
                    // if the serviceTransaction has a TreatmentPlanId call TreatmentPlan add services otherwise save serviceTransaction as normal
                    if ($scope.serviceTransaction.TreatmentPlanId) {
                      ctrl.saveServiceTransactionsToTreatmentPlans(
                        serviceTransactions
                      );
                    } else if ($scope.passinfo) {
                      ctrl.servicesAdded(serviceTransactions);
                    } else {
                      // TODO add error handling?
                      patientServices.ServiceTransactions.save(
                        params,
                        serviceTransactions,
                        ctrl.servSuccess,
                        function () {
                          $scope.saving = false;
                        }
                      );
                    }
                    deferred.resolve();
                  }
                );
              });
          }
        }
      } else {
        if (
          !$scope.serviceTransaction ||
          $scope.serviceTransaction.ProviderUserId == null ||
          $scope.serviceTransaction.ProviderUserId === '' ||
          _.isUndefined($scope.serviceTransaction.ProviderUserId)
        ) {
          $scope.noProvider = true;
        }
        if (
          $scope.isFromAccountSummary &&
          (!$scope.serviceTransaction ||
            $scope.serviceTransaction.ProviderOnClaimsId == null ||
            $scope.serviceTransaction.ProviderOnClaimsId === '' ||
            _.isUndefined($scope.serviceTransaction.ProviderOnClaimsId))
        ) {
          $scope.noClaimsProvider = true;
        }
        deferred.resolve();
      }

      return deferred.promise.then(() => {
        if ($scope.serviceTransaction) {
          $scope.serviceTransaction.TreatmentPlanId = '';
        }
      });
    };

    ctrl.servicesAdded = function (serviceTransactionsTemp) {
      $scope.saving = false;
      //if we are dealing with multiple services from the new locations
      $rootScope.$broadcast('updatedServicesToAdd', serviceTransactionsTemp);
      if ($scope.isSwiftCode) {
        $rootScope.$broadcast('nextServiceCode');
      } else {
        $scope.close();
      }
    };

    ctrl.servSuccess = function (res) {
      $scope.saving = false;
      $scope.serviceTransaction.ServiceTransactionStatusId = '1';
      var actionVerb = $scope.editMode ? 'updated' : 'created';
      var msg = localize.getLocalizedString('{0} {1}', [
        'Your patient service',
        'has been ' + actionVerb,
      ]);

      toastrFactory.success(msg, localize.getLocalizedString('Success'));

      var savedServiceTransactions = res && res.Value ? res.Value : [];
      if (savedServiceTransactions.length > 0) {
        ctrl.addServicesToNewTreatmentPlan(savedServiceTransactions);
        $rootScope.$broadcast(
          'reloadProposedServices',
          savedServiceTransactions
        );
        if (!$scope.isSwiftCode || $scope.isLastcode) {
          $rootScope.$broadcast('soar:chart-services-reload-ledger');
        }
      }
      if (!$scope.isSwiftCode) $scope.close();
      else {
        $scope.$parent.$parent.nextSwftPkServCode();
      }
    };

    $scope.getNextService = function () {
      if ($scope.passinfo) {
        $rootScope.$broadcast('nextServiceCode');
      } else {
        $scope.$parent.$parent.nextSwftPkServCode();
      }
    };

    $scope.getPreviousService = function () {
      $scope.$parent.$parent.nextSwftPkServCode();
    };
    //#region load service transactions to treatmentPlanServices

    ctrl.getSelectedTreatmentPlanSummary = function (treatmentPlanHeaderId) {
      var treatementPlanHeader = {};
      _.forEach($scope.treatmentPlanSummaries, function (treatmentPlanSummary) {
        if (treatmentPlanSummary.TreatmentPlanId === treatmentPlanHeaderId) {
          treatementPlanHeader = treatmentPlanSummary;
        }
      });
      return treatementPlanHeader;
    };

    // success callback for add service
    ctrl.addServiceSuccess = function (res) {
      $scope.saving = false;
      if (res && res.Value && res.Value[0]) {
        var treatmentPlanServices = res.Value;
        $rootScope.$broadcast(
          'soar:tx-plan-services-changed',
          treatmentPlanServices,
          false
        );
        if (treatmentPlanServices.length > 0) {
          var serviceTransactionstoLoad = [];
          _.forEach(treatmentPlanServices, function (tps) {
            serviceTransactionstoLoad.push(tps.ServiceTransaction);
          });
          $rootScope.$broadcast(
            'reloadProposedServices',
            serviceTransactionstoLoad
          );
          if (!$scope.isSwiftCode || $scope.isLastcode) {
            $rootScope.$broadcast('soar:chart-services-reload-ledger');
          }
          $rootScope.$broadcast('soar:tx-plan-services-changed', null, true);
        }

        if (!$scope.isSwiftCode) $scope.close();
        else {
          $scope.serviceTransaction = {};
          $scope.$parent.$parent.nextSwftPkServCode();
        }
      }
    };

    ctrl.loadServiceTransactionsToTreatmentPlanServices = function (
      serviceTransactions
    ) {
      // set TreatmentPlanId on header based on selected summary
      var treatmentPlanSummary = ctrl.getSelectedTreatmentPlanSummary(
        serviceTransactions[0].TreatmentPlanId
      );
      var treatmentPlanServiceHeader = {
        TreatmentPlanId: treatmentPlanSummary.TreatmentPlanId,
        PersonId: $scope.personId,
        TreatmentPlanGroupNumber: $scope.stageSelected.number,
      };

      if ($scope.editMode) {
        treatmentPlanServiceHeader.ServiceTransactionId =
          serviceTransactions[0].ServiceTransactionId;
      }

      var treatmentPlanServices = [];
      _.forEach(serviceTransactions, function (serviceTransaction) {
        var treatmentPlanService = {
          ServiceTransaction: _.cloneDeep(serviceTransaction),
          TreatmentPlanServiceHeader: _.cloneDeep(treatmentPlanServiceHeader),
        };
        treatmentPlanServices.push(treatmentPlanService);
      });
      return treatmentPlanServices;
    };

    // save the treatmentPlanServices
    ctrl.saveServiceTransactionsToTreatmentPlans = function (
      serviceTransactions
    ) {
      var treatmentPlanId = serviceTransactions[0].TreatmentPlanId;
      var treatmentPlanServices = ctrl.loadServiceTransactionsToTreatmentPlanServices(
        serviceTransactions
      );

      // get the last Priority for this plan
      treatmentPlansFactory.NextPriority(treatmentPlanId).then(function (res) {
        // add Priority to service or services
        treatmentPlansFactory.AddPriorityToServices(
          treatmentPlanServices,
          res.Value
        );
        treatmentPlansFactory
          .SaveServicesToExistingTreatmentPlan(
            $scope.personId,
            treatmentPlanId,
            treatmentPlanServices
          )
          .then(function (res) {
            ctrl.addServiceSuccess(res);
            $scope.saving = false;
          });
      });
    };

    // hitting the close x in these windows leaves the calendar widget orphaned on the screen if it is open, can't find a better way to resolve this
    $timeout(function () {
      var kendoWindow = angular
        .element('#toothCtrlsWindowPatChart')
        .data('kendoWindow');
      if (kendoWindow) {
        kendoWindow.wrapper.find('.k-i-close').click(function () {
          angular
            .element('.uib-datepicker-popup')
            .attr('style', 'display:none;');
        });
      }
      var kendoWindow2 = angular
        .element('#toothCtrlsWindow')
        .data('kendoWindow');
      if (kendoWindow2) {
        kendoWindow2.wrapper.find('.k-i-close').click(function () {
          angular
            .element('.uib-datepicker-popup')
            .attr('style', 'display:none;');
        });
      }
    }, 1000);

    ctrl.updateChartLedger = function () {
      // if this is closed during last service in a series (swiftCode), broadcast to update the chartLedger with
      // in case any of the other swift code services need to be updated
      if ($scope.isSwiftCode && $scope.isLastcode) {
        $rootScope.$broadcast('soar:chart-services-reload-ledger');
      }
    };

    $scope.close = function () {
      $scope.modalClosing = true;
      $scope.loadProviderSelector = false;
      $scope.activeTeeth = [];
      $scope.currentServiceCode = null;
      $rootScope.$broadcast('close-tooth-window', true);
      ctrl.updateChartLedger();
    };

    $scope.surfaces = [
      {
        SurfaceText: 'M',
        SurfaceAbbreviation: 'M',
        SurfaceName: 'Mesial',
      },
      {
        SurfaceText: 'O/I',
        SurfaceAbbreviation: 'O/I',
        SurfaceName: 'Occl/Incsl',
      },
      {
        SurfaceText: 'D',
        SurfaceAbbreviation: 'D',
        SurfaceName: 'Distal',
      },
      {
        SurfaceText: 'B/F',
        SurfaceAbbreviation: 'B/F',
        SurfaceName: 'Buccal/Facl',
      },
      {
        SurfaceText: 'L',
        SurfaceAbbreviation: 'L',
        SurfaceName: 'Lingual',
      },
      {
        SurfaceText: 'B/F5',
        SurfaceAbbreviation: 'B5/F5',
        SurfaceName: 'Buccal/Facl V',
      },
      {
        SurfaceText: 'L5',
        SurfaceAbbreviation: 'L5',
        SurfaceName: 'Lingual V',
      },
    ];

    $scope.quadrants = [
      {
        QuadrantName: 'UR',
      },
      {
        QuadrantName: 'LR',
      },
      {
        QuadrantName: 'UL',
      },
      {
        QuadrantName: 'LL',
      },
    ];

    $scope.arches = [
      {
        ArchName: 'UA',
      },
      {
        ArchName: 'LA',
      },
    ];

    ctrl.filterProviders = function (providers) {
      ctrl.filteredProvidersResult = _.filter(providers, function (value) {
        if (value.isActive) {
          return value;
        }
      });
      return ctrl.filteredProvidersResult;
    };
    $scope.loadProviders = function () {
      var result = [];
      // use LoadedProviders if loaded by parent, otherwise get
      if (usersFactory.LoadedProviders) {
        result = usersFactory.LoadedProviders;
        $scope.providers = ctrl.filterProviders(result);
        ctrl.filterProvidersByLocation();
      } else {
        usersFactory
          .Users()
          .then(ctrl.loadProvidersSuccess, ctrl.loadProvidersFailure);
      }
      $timeout(function () {
        $scope.$apply();
      });
    };

    ctrl.loadProvidersSuccess = function (res) {
      $scope.providers = ctrl.filterProviders(res.Value);
      ctrl.filterProvidersByLocation();
    };

    ctrl.loadProvidersFailure = function () {
      $scope.providers = [];
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['Providers']
        ),
        localize.getLocalizedString('Error')
      );
    };

    //#endregion

    // k-change on kendo-multi-select uses this to keep activeTeeth updated
    // only allow one tooth choice on edit of service
    $scope.activeTeethUpdated = function () {
      var selectedTeeth = this.value();
      // Bug 380408 SmartCodes for serviceCodes with AffectedAreaId of 3 are based on which teeth are selected
      // We need to prohibit selecting more than one for these codes because the smart code changes based on teeth, not
      // surfaces or channels

      //PBI 389261 is overriding the above comment. Leaving comment in for historical purposes.
      //var preventMultipleSelection = ($scope.isEdit === true);

      if ($scope.isEdit === true && selectedTeeth.length > 1) {
        $scope.activeTeeth = selectedTeeth.slice(-1);
        this.dataSource.filter({});
        this.value($scope.activeTeeth);
      } else {
        $scope.activeTeeth = this.value();
      }

      $scope.validateForm();
      $timeout(function () {
        $scope.$apply();
      });
    };

    //#region determine if service associated with a treatment plan

    // NOTE this method expects a list of serivceTransactionIds
    ctrl.checkForAssociatedTxPlans = function (serviceTransactionId) {
      if (serviceTransactionId) {
        var defer = $q.defer();
        var serviceTransactionIds = [];
        serviceTransactionIds.push(serviceTransactionId);
        treatmentPlansFactory
          .GetTxPlanFlags(serviceTransactionIds)
          .then(function (res) {
            ctrl.isAssociatedWithTreatmentPlan = res.Value[0].Value;
            $scope.locationsDisabled = res.Value[0].Value;
            ctrl.setLocationDisabled();
            defer.resolve();
          });
        return defer.promise;
      }
    };

    //#endregion

    // disable all controls if this service is completed
    ctrl.setAllowEditing = function (serviceTransaction) {
      $scope.allowEditing = true;
      $scope.allowProviderEditing = true;

      let result = appointmentServiceProcessingRulesService.processAppointmentServiceEditRules(
        serviceTransaction,
        ctrl.serviceTransactionStatuses,
        $scope.isFromAppointmentModal
      );

      // set the editing values based on results of the method
      $scope.allowEditing = result.allowEditingMainFields;
      $scope.allowProviderEditing = result.allowEditingProvider;
      $scope.showProviderSelectorForAppointmentServices =
        result.showProviderSelectorForAppointmentServices;
      $scope.showProviderSelector = result.showProviderSelector;

      if (
        $scope.allowEditing === false &&
        $scope.allowProviderEditing === false
      ) {
        $scope.canSave = false;
      }

      ctrl.setMultiSelectEnabled($scope.allowEditing);
    };

    ctrl.setMultiSelectEnabled = function (allowEditing) {
      if ($scope.teethSelectOptions) {
        //special handling for the tooth selector
        var multiSelect = angular
          .element('select#teethMultiSelect')
          .data('kendoMultiSelect');
        if (!_.isNil(multiSelect)) {
          multiSelect.enable(allowEditing);
        }
      }
    };

    //#region determine if status can be edited

    // on edit determine if we can edit the status
    ctrl.setStatusDisabled = function (serviceTransaction) {
      $scope.statusDisabled = false;
      //edit status if this service is associated with a treatment plan
      if (ctrl.isAssociatedWithTreatmentPlan === true) {
        $scope.statusDisabled = false;
        //donot show the status existing when the service associated with txplan
        ctrl.filterServiceTransactionStatusesForTxPlan();
      }
      // cannot edit status if this service is associated with an appointment
      if (!_.isNil(serviceTransaction.AppointmentId)) {
        $scope.statusDisabled = true;
      }
      // cannot edit status if this service is associated with an encounter
      if (!_.isNil(serviceTransaction.EncounterId)) {
        $scope.statusDisabled = true;
      }
    };

    //#endregion

    //#region edit service transaction get

    /**
     * check for changes to the affected area of a service code which would change the properties allowed for this service transaction
     * null any properties that aren't valid for the new AffectedAreaId
     *
     * @param {*} serviceTransaction
     * @returns {angular.IPromise<any>}
     */
    ctrl.checkPropertiesByAffectedArea = function (serviceTransaction) {
      return referenceDataService
        .getData(referenceDataService.entityNames.serviceCodes)
        .then(function (serviceCodes) {
          proposedServiceFactory.checkPropertiesByAffectedArea(
            serviceTransaction,
            serviceCodes
          );
        });
    };

    // refilter statuses if control is disabled so that the current status shows
    ctrl.filterServiceTransactionStatusesForEdit = function () {
      if ($scope.statusDisabled === true) {
        $scope.filteredServiceTransactionStatuses =
          ctrl.serviceTransactionStatuses;
      }
    };

    /**
     * Edit service transaction.
     *
     * @returns {angular.IPromise}
     */
    ctrl.editServiceTransaction = function () {
      var deferred = $q.defer();

      $scope.isLocationChanged = true;
      $scope.editMode = true;
      if (!$scope.passinfo) {
        $scope.serviceTransactionId =
          patientServicesFactory.ActiveServiceTransactionId;
        $scope.locationsDisabled = false;

        ctrl
          .checkForAssociatedTxPlans($scope.serviceTransactionId)
          .then(function () {
            var deferred2 = $q.defer();

            if ($scope.serviceTransactionId) {
              patientServicesFactory
                .getById($scope.personId, $scope.serviceTransactionId)
                .then(function (res) {
                  $scope.serviceTransaction = res.Value;
                  if (
                    $scope.serviceTransaction.AppointmentId !== null &&
                    $scope.serviceTransaction.AppointmentId !== undefined
                  ) {
                    schedulingApiService
                      .getAppointmentProviders(
                        $scope.serviceTransaction.AppointmentId
                      )
                      .then(function (result) {
                        // now that we have the list of providers we can show. We need to see if the current assigned provider on a service is in the list.
                        // if the new provider is not in the list we need to add them as an historical value that has to also be included for backwards compatibility.
                        $scope.appointmentProvidersList = appointmentServiceProcessingRulesService.processAppointmentServiceProviders(
                          $scope.serviceTransaction,
                          result
                        );

                        ctrl.setAllowEditing($scope.serviceTransaction);
                        $scope.serviceTransaction.AffectedAreaId = $scope.area;

                        ctrl.setControlValues().then(() => deferred2.resolve());
                      });
                  } else {
                    ctrl.setAllowEditing($scope.serviceTransaction);
                    $scope.serviceTransaction.AffectedAreaId = $scope.area;

                    ctrl.setControlValues().then(() => deferred2.resolve());
                  }
                });
            }

            return deferred2.promise.then(() => {
              // reset ActiveServiceTransactionId to null
              patientServicesFactory.setActiveServiceTransactionId(null);
              deferred.resolve();
            });
          });
      } else {
        if ($scope.serviceTransaction.ServiceTransactionId) {
          ctrl
            .checkForAssociatedTxPlans(
              $scope.serviceTransaction.ServiceTransactionId
            )
            .then(function () {
              ctrl.setControlValues().then(() => {
                // reset ActiveServiceTransactionId to null
                patientServicesFactory.setActiveServiceTransactionId(null);
                deferred.resolve();
              });
            });
        } else {
          ctrl.isAssociatedWithTreatmentPlan = false;
          $scope.locationsDisabled = false;

          ctrl.setControlValues().then(() => deferred.resolve());
        }
      }

      return deferred.promise;
    };

    /**
     * Set control values.
     *
     * @returns {angular.IPromise}
     */
    ctrl.setControlValues = function () {
      // set status dropdown enabled / disabled
      ctrl.setStatusDisabled($scope.serviceTransaction);
      // filter statuses
      ctrl.filterServiceTransactionStatusesForEdit();

      // set tooth info
      ctrl.setToothInfo($scope.serviceTransaction.Tooth);

      ctrl.setActiveSurfaces(
        $scope.serviceTransaction.AffectedAreaId,
        $scope.serviceTransaction.Surface
      );

      ctrl.setActiveRoots(
        $scope.serviceTransaction.AffectedAreaId,
        $scope.serviceTransaction.Roots
      );

      // convert the display date to actual transaction time zone date
      var locationTmp = _.find(ctrl.locations, {
        LocationId: $scope.serviceTransaction.LocationId,
      });
      var locationTimezone = locationTmp ? locationTmp.Timezone : '';
      var displayDate = locationTimezone
        ? timeZoneFactory.ConvertDateTZString(
            $scope.serviceTransaction.DateEntered,
            locationTimezone
          )
        : moment.utc($scope.serviceTransaction.DateEntered).toDate();
      ctrl.setTimeZoneDate();

      // use this date to determine if the date has been manually changed
      ctrl.originalDisplayDate = displayDate;
      $scope.serviceTransaction.$$DateEntered = displayDate;

      // backup after modifying date
      $scope.originalServiceTransaction = _.cloneDeep(
        $scope.serviceTransaction
      );

      return ctrl
        .checkPropertiesByAffectedArea($scope.serviceTransaction)
        .then(function () {
          ctrl.checkUserLocationAssignment();
        });
    };

    ctrl.setActiveRoots = function (affectedAreaId, roots) {
      if (affectedAreaId === 3 && roots) {
        var selectedRoots = roots.split(',');
        _.forEach(selectedRoots, function (root) {
          // find root in activeRoots
          _.forEach($scope.roots, function (rt) {
            var contains = rt.RootAbbreviation.indexOf(root) > -1;
            if (contains) {
              rt.selected = true;
            }
          });
        });
      }
    };

    // logic for deciding to use returned nextSmartCode
    ctrl.setNextSmartCodeForRootAffectedArea = function (
      nextSmartCode,
      originalSmartCode
    ) {
      // Check to ensure the next code is in the current smart code group
      var match = $scope.smartCodeGroup.filter(
        $scope.checkSmartCodeGroup,
        nextSmartCode
      );
      // if CdtCode has not changed return original smart code
      if (
        nextSmartCode &&
        nextSmartCode.CdtCode !== $scope.currentServiceCode.CdtCodeName
      ) {
        // if nextSmartCode is in scope.smartCodeGroup use it
        if (match.length > 0) {
          return nextSmartCode;
        }
        // else return original
        return originalSmartCode;
      }
      return originalSmartCode;
    };

    // smart code logic for service codes with an affected area of 3 (roots based)
    // NOTE the number of roots selected does not matter, just the number of roots the selected tooth has
    ctrl.getNextSmartCodeForRootAffectedArea = function (numberOfRoots) {
      // prevent this code from processing if the modal is closing
      if ($scope.modalClosing !== true) {
        // store the previous code
        var previousSmartCode = $scope.nextSmartCode.ServiceCodeId
          ? angular.copy($scope.nextSmartCode)
          : angular.copy($scope.currentServiceCode);

        var serviceStatus =
          $scope.serviceTransaction &&
          $scope.serviceTransaction.ServiceTransactionStatusId
            ? $scope.serviceTransaction.ServiceTransactionStatusId.toString()
            : '';
        // if status is not 'Completed'
        if (serviceStatus !== '4') {
          if (
            numberOfRoots.length > 0 &&
            $scope.currentServiceCode.UseSmartCodes
          ) {
            // get nextSmartCode based on number of roots
            var nextSmartCode = proposedServiceFactory.GetSmartCodeForRootAffectedArea(
              numberOfRoots,
              $scope.currentServiceCode
            );
            // set scope.nextSmartCode
            $scope.nextSmartCode = ctrl.setNextSmartCodeForRootAffectedArea(
              nextSmartCode,
              $scope.originalSmartCode
            );
            // only reset the fee if the ServiceCodeId has changed
            var skipFee =
              nextSmartCode &&
              previousSmartCode &&
              nextSmartCode.ServiceCodeId === previousSmartCode.ServiceCodeId;
            // set the service transaction to the nextSmartCode
            ctrl.resetServiceTransaction($scope.nextSmartCode, skipFee);
            $scope.currentServiceCode.Description =
              $scope.nextSmartCode.Description;
            // change window title based on nextSmartCode
            ctrl.appendKendoWindowTitle(
              previousSmartCode,
              $scope.nextSmartCode
            );
          } else if (numberOfRoots.length == 0 && $scope.originalSmartCode) {
            // set the service transaction to the originalSmartCode
            ctrl.resetServiceTransaction($scope.originalSmartCode);
            $scope.currentServiceCode.Description =
              $scope.originalSmartCode.Description;
            $scope.nextSmartCode = $scope.originalSmartCode;
            // change window title based on nextSmartCode
            ctrl.appendKendoWindowTitle(
              previousSmartCode,
              $scope.nextSmartCode
            );
          }
        }
      }
    };

    // method handles smart code logic when affectedArea is 3 and tooth has been selected
    // NOTE only one tooth can be used for root based smart codes
    ctrl.checkSmartCodesForRoots = function (activeTeeth) {
      if (
        $scope.currentServiceCode &&
        $scope.currentServiceCode.AffectedAreaId === 3
      ) {
        if (!_.isNil(activeTeeth) && activeTeeth.length > 0) {
          if (
            $scope.currentServiceCode &&
            $scope.currentServiceCode.UseSmartCodes
          ) {
            // smart codes for affectedArea 3 require that only on tooth be selected
            // we will default to first tooth in activeTeeth
            var teeth = activeTeeth.length > 0 ? activeTeeth[0] : [];

            // what is the number of roots for this active tooth
            var numberOfRoots = proposedServiceFactory.GetNumberOfRoots(teeth);
            // what is the smart code for this tooth
            ctrl.getNextSmartCodeForRootAffectedArea(numberOfRoots);
          }
        }
      }
    };

    ctrl.getRootSmartCodeForTooth = function (tooth) {
      if (!_.isNil(tooth)) {
        if (
          $scope.currentServiceCode &&
          $scope.currentServiceCode.UseSmartCodes
        ) {
          // what is the number of roots for this active tooth
          var numberOfRoots = proposedServiceFactory.GetNumberOfRoots(
            tooth.USNumber
          );
          // what is the smart code for this tooth
          var response = proposedServiceFactory.GetSmartCodeForRootAffectedArea(
            numberOfRoots,
            $scope.currentServiceCode
          );
          return !_.isNil(response) && response != ''
            ? response.ServiceCodeId
            : $scope.currentServiceCode.ServiceCodeId;
        } else {
          return $scope.currentServiceCode.ServiceCodeId;
        }
      }
    };

    // Get the currently selected roots
    $scope.getSelectedRoots = function (activeTeeth) {
      var selectedRoots = [];
      selectedRoots =
        activeTeeth.length > 0
          ? proposedServiceFactory.GetNumberOfRoots(
              angular.copy(activeTeeth.join(', '))
            )
          : proposedServiceFactory.GetNumberOfRoots('');
      if (selectedRoots && activeTeeth && activeTeeth.length > 0) {
        ctrl.getNextSmartCode(selectedRoots);
      } else {
        ctrl.getNextSmartCode([]);
      }
    };

    // set active surfaces
    ctrl.setActiveSurfaces = function (affectedAreaId, surfaces) {
      if (affectedAreaId === 4 && surfaces) {
        var selectedSurfaces = surfaces.split(',');
        _.forEach(selectedSurfaces, function (surface) {
          _.forEach($scope.surfaces, function (sfc) {
            // split surface abbreviations by /
            var surfaceAbbreviations = sfc.SurfaceAbbreviation.split('/');
            _.forEach(surfaceAbbreviations, function (sfca) {
              if (sfca === surface && !sfc.selected) {
                sfc.selected = true;
                $scope.activeSurfaces.push(sfc);
              }
            });
          });
        });
      }
    };

    // populate active tooth
    ctrl.setToothInfo = function (tooth) {
      // set active teeth
      $scope.activeTeeth = [];
      if (tooth) {
        $scope.activeTeeth.push(tooth);
      }
      ctrl.setToothData();
    };

    $scope.$watch('serviceTransaction.$$DateEntered', function (nv, ov) {
      if (_.isEqual(nv, ov)) {
        return;
      }
      if (nv && ov && nv !== ov) {
        $scope.dataHasChanged = true;
        $scope.validateForm();
      }
    });

    // Days difference from original DateEntered to current DateEntered in hours if any
    ctrl.hoursDifference = function (originalDate, currentDate) {
      var start = moment(originalDate);
      var end = moment(currentDate);
      var hours = end.diff(start, 'hours');
      return hours;
    };

    // Days difference from original DateEntered to current DateEntered in days if any
    ctrl.daysDifference = function (originalDate, currentDate) {
      var start = moment(originalDate);
      var end = moment(currentDate);
      var days = end.diff(start, 'days');
      return days;
    };

    //do not change DateEntered unless the user has manually changed it more than 24 hours
    ctrl.checkDateEntered = function () {
      var daysDiff = ctrl.daysDifference(
        ctrl.originalDisplayDate,
        $scope.serviceTransaction.$$DateEntered
      );
      if (daysDiff !== 0) {
        var hoursDiff = ctrl.hoursDifference(
          ctrl.originalDisplayDate,
          $scope.serviceTransaction.$$DateEntered
        );
        var currentDate = new Date(
          Date.parse($scope.serviceTransaction.DateEntered)
        );
        currentDate = moment(currentDate).add(hoursDiff, 'hours');
        $scope.serviceTransaction.DateEntered = $filter('setDateTime')(
          currentDate
        );
      }
    };

    //#endregion

    /**
     * Update service transaction.
     *
     * @returns {angular.IPromise}
     */
    ctrl.updateServiceTransaction = function () {
      return ctrl.captureToothInfo($scope.serviceTransaction).then(() => {
        // set object state
        if (
          $scope.passinfo &&
          $scope.serviceTransaction.ObjectState !== saveStates.Add
        ) {
          $scope.serviceTransaction.ObjectState = saveStates.Update;
        } else if (!$scope.passinfo) {
          $scope.serviceTransaction.ObjectState = saveStates.Update;
        }

        if (
          $scope.nextSmartCode &&
          $scope.nextSmartCode.ServiceCodeId &&
          $scope.nextSmartCode.ServiceCodeId != null
        ) {
          $scope.serviceTransaction.Description = null;
        }
        ctrl.setFeeForExistingService($scope.serviceTransaction);

        var serviceTransactions = [];
        serviceTransactions.push($scope.serviceTransaction);

        // this scrubs any properties in the event that the 'parent' service code's affected area has changed since the proposed service was created
        return referenceDataService
          .getData(referenceDataService.entityNames.serviceCodes)
          .then(function (serviceCodes) {
            serviceCodesService.CheckForAffectedAreaChanges(
              serviceTransactions,
              serviceCodes,
              false
            );

            // txplans were no longer being attached in edit mode, adding this to try and fix bug 228883
            if (!$scope.passinfo && $scope.serviceTransaction.TreatmentPlanId) {
              ctrl.saveServiceTransactionsToTreatmentPlans(serviceTransactions);
            } else {
              if ($scope.passinfo) {
                $rootScope.$broadcast(
                  'edittedService',
                  $scope.serviceTransaction
                );
                $scope.close();
              } else {
                patientServicesFactory
                  .update(
                    serviceTransactions,
                    $scope.isTreatmentPlan,
                    $scope.treatmentPlanName,
                    $scope.treatmentPlanGroupNumber
                  )
                  .then(
                    function (res) {
                      var savedServiceTransactions = res.Value;
                      if (savedServiceTransactions.length > 0) {
                        // NOTE TODO the next two should be replaced by a property on the factory but that is outside of the scope of this pbi
                        $rootScope.$broadcast(
                          'reloadProposedServices',
                          savedServiceTransactions
                        );
                        $rootScope.$broadcast(
                          'soar:chart-services-reload-ledger'
                        );
                        $scope.close();
                      }
                    },
                    function () {
                      $scope.formIsValid = true;
                      $scope.saving = false;
                    }
                  );
              }
            }
          });
      });
    };

    /**
     * capture surface root quadrant info
     *
     * @returns {angular.IPromise}
     */
    ctrl.captureToothInfo = function () {
      // set tooth number based on active teeth
      var toothItem = null;
      return referenceDataService
        .getData(referenceDataService.entityNames.serviceCodes)
        .then(function (serviceCodes) {
          if ($scope.activeTeeth && $scope.activeTeeth.length > 0) {
            if (
              _.isUndefined($scope.serviceTransaction.UseCodeForRangeOfTeeth)
            ) {
              var serviceCode = _.find(serviceCodes, {
                ServiceCodeId: $scope.serviceTransaction.ServiceCodeId,
              });
              if (serviceCode) {
                $scope.serviceTransaction.UseCodeForRangeOfTeeth =
                  serviceCode.UseCodeForRangeOfTeeth;
              }
            }
            $scope.serviceTransaction.Tooth = $scope.serviceTransaction
              .UseCodeForRangeOfTeeth
              ? $scope.activeTeeth.join(',')
              : $scope.activeTeeth[0];
            toothItem = ctrl.getToothDetails($scope.serviceTransaction.Tooth);
          }
          switch ($scope.serviceTransaction.AffectedAreaId) {
            case 3:
              var roots = $scope.getrootsForTooth(toothItem);
              $scope.serviceTransaction.Roots = roots ? roots : null;
              break;
            case 4:
              var surfaces = $scope.getselectedSurfaces(toothItem);
              $scope.serviceTransaction.Surface = surfaces ? surfaces : null;
              break;
          }
        });
    };

    ctrl.setDataHasChanged = function () {
      // dateEnteredHasChanged can only be true if this is an edited serviceTransaction
      var dateEnteredHasChanged = false;
      if (
        $scope.originalServiceTransaction &&
        $scope.originalServiceTransaction.$$DateEntered
      ) {
        dateEnteredHasChanged = !_.isEqual(
          $scope.originalServiceTransaction.$$DateEntered,
          $scope.serviceTransaction.$$DateEntered
        );
      }
      $scope.dataHasChanged =
        !angular.equals(
          $scope.originalServiceTransaction,
          $scope.serviceTransaction
        ) || dateEnteredHasChanged;
      ctrl.checkUserLocationAssignment();
    };

    //#region

    // get list of user locations for the dropdown
    $scope.locationsLoading = true;
    $scope.userLocations = [];

    ctrl.checkUserLocationAssignment = function () {
      $scope.userHasLocationAssignment =
        $scope.mode !== 'Service' || !$scope.isEdit;
      if (
        $scope.mode === 'Service' &&
        $scope.isEdit &&
        $scope.serviceTransaction &&
        $scope.serviceTransaction.LocationId &&
        $scope.userLocations &&
        ctrl.locations
      ) {
        if (
          listHelper.findIndexByFieldValue(
            $scope.userLocations,
            'LocationId',
            $scope.serviceTransaction.LocationId
          ) === -1
        ) {
          // if not in list add the location so it shows in dropdown
          var ofcLocation = _.find(ctrl.locations, {
            LocationId: $scope.serviceTransaction.LocationId,
          });
          if (ofcLocation) {
            $scope.userLocations.push(ofcLocation);
          }
        }
      }

      $scope.serviceLocationMatch = true;
      $scope.saveTooltip = localize.getLocalizedString('Save');
    };

    // check on whether to this user has view permissions at this location
    ctrl.hasAccessAtLocation = function (location) {
      return patSecurityService.IsAuthorizedByAbbreviationAtLocation(
        AmfaKeys.SoarClinCpsvcView,
        location.LocationId
      );
    };

    // get user locations by practice roles
    ctrl.getUserLocations = function () {
      // check access for this user for all locations
      _.forEach(ctrl.locations, function (location) {
        // only show locations where the provider has access
        if (ctrl.hasAccessAtLocation(location)) {
          $scope.userLocations.push(location);
        }
      });
      ctrl.checkUserLocationAssignment();
      $scope.locationsLoading = false;
    };

    /**
     * Get practice locations.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getPracticeLocations = function () {
      $scope.locationsLoading = true;
      return referenceDataService
        .getData(referenceDataService.entityNames.locations)
        .then(function (locations) {
          ctrl.locations = locations;
          ctrl.getUserLocations();
        });
    };
    ctrl.getPracticeLocations();

    // filter providers by location
    $scope.providersByLocation = [];
    ctrl.filterProvidersByLocation = function () {
      $scope.providersByLocation = [];

      if ($scope.serviceTransaction && $scope.serviceTransaction.LocationId) {
        _.forEach($scope.providers, function (provider) {
          var locationItem = listHelper.findItemByFieldValue(
            provider.Locations,
            'LocationId',
            $scope.serviceTransaction.LocationId
          );
          if (locationItem) {
            $scope.providersByLocation.push(provider);
          }
        });
        ctrl.setPreferredProviderByLocation();
      } else if ($scope.passinfo) {
        $scope.serviceTransaction.LocationId = ctrl.getLocationId();
        _.forEach($scope.providers, function (provider) {
          var locationItem = listHelper.findItemByFieldValue(
            provider.Locations,
            'LocationId',
            $scope.serviceTransaction.LocationId
          );
          if (locationItem) {
            $scope.providersByLocation.push(provider);
          }
        });
        ctrl.setPreferredProviderByLocation();
      }
      // note this could be used to display message if no users
      $scope.noProvidersAtLocation = _.isEmpty($scope.providersByLocation);
    };

    // reset fee to location when location changes
    ctrl.resetFeeByLocation = function () {
      if (
        $scope.mode === 'Service' &&
        $scope.serviceTransaction &&
        $scope.serviceTransaction.LocationId
      ) {
        if ($scope.currentServiceCode) {
          referenceDataService.setFeesByLocation(
            $scope.currentServiceCode,
            $scope.serviceTransaction.LocationId
          );
        }
        if (!$scope.editMode && !$scope.isEdit && $scope.currentServiceCode) {
          // this should only reset service transaction fee of new serviceTransaction
          $scope.serviceTransaction.Fee =
            $scope.currentServiceCode.$$locationFee;
        }
      }
    };

    // when location changes, reset preferred provider for location and patient
    ctrl.setPreferredProviderByLocation = function () {
      if (
        $scope.providersByLocation.length > 0 &&
        !$scope.editMode &&
        !$scope.passinfo &&
        $scope.patientInfo
      ) {
        var currentUser = $rootScope.patAuthContext.userInfo;
        var providerId = usersFactory.PreferredProviderByLocation(
          currentUser.userid,
          $scope.patientInfo,
          $scope.serviceTransaction.UsuallyPerformedByProviderTypeId,
          $scope.providersByLocation
        );
        $timeout(function () {
          if (providerId) {
            $scope.serviceTransaction.ProviderUserId = providerId;
          }
        }, 0);
      }
    };

    // watch for location changes
    $scope.$watch('serviceTransaction.LocationId', function (nv, ov) {
      if (nv && nv !== ov) {
        ctrl.filterProvidersByLocation();
        ctrl.resetFeeByLocation();
      }
    });

    ctrl.getLocationId = function () {
      var currentLocation = locationService.getCurrentLocation();
      var selectedLocationId = currentLocation.id;

      if ($scope.serviceTransaction && $scope.serviceTransaction.LocationId) {
        selectedLocationId = $scope.serviceTransaction.LocationId;
      }
      return selectedLocationId;
    };

    //#region handling for a new treatment plan

    ctrl.addServicesToNewTreatmentPlan = function (savedServiceTransactions) {
      if ($scope.isNewTreatmentPlan) {
        $rootScope.$broadcast(
          'addServicesToNewTreatmentPlan',
          savedServiceTransactions
        );
      }
    };

    //#endregion

    // reset columns after service code change
    ctrl.resetServiceTransaction = function (newServiceCode, skipFee) {
      if (newServiceCode && $scope.serviceTransaction) {
        $scope.serviceTransaction.ServiceCodeId = newServiceCode.ServiceCodeId;
        //need to  backup the fee
        // after selecting the surface and changing the status, needs to pull back the correct surface fee.
        $scope.serviceTransactionFeeBackUp = newServiceCode.$$locationFee;
        // if status is not Referred, Referred Completed, Existing then we can set location fee
        if (
          !skipFee &&
          $scope.existingService === false &&
          $scope.referredService === false
        ) {
          $scope.serviceTransaction.Fee = newServiceCode.$$locationFee;
        }
        // bug 357056 ensure that existing service fee is always 0
        // Referred, Referred Completed we need to set fee to zero
        if (
          $scope.existingService === true ||
          $scope.referredService === true
        ) {
          $scope.serviceTransaction.Fee = 0;
          $scope.serviceTransaction.Discount = 0;
        }
        $scope.serviceTransaction.CdtCodeName = newServiceCode.CdtCodeName;
        $scope.serviceTransaction.Code = newServiceCode.Code;
        $scope.serviceTransaction.AffectedAreaId =
          newServiceCode.AffectedAreaId;
        $scope.serviceTransaction.Description = newServiceCode.Description;
        $scope.serviceTransaction.CompleteDescription =
          newServiceCode.Description;
        if (
          newServiceCode.CdtCodeName !== null &&
          newServiceCode.CdtCodeName !== '' &&
          newServiceCode.CdtCodeName !== undefined
        )
          $scope.serviceTransaction.CompleteDescription =
            newServiceCode.Description +
            ' (' +
            newServiceCode.CdtCodeName +
            ')';
        $scope.serviceTransaction.DisplayAs = newServiceCode.DisplayAs;
      }
    };
    //#endregion

    /**
     * Set values on service transaction for new code.
     *
     * @param {*} newServiceCodeId
     * @returns {angular.IPromise}
     */
    ctrl.setValuesOnServiceTransactionForNewCode = function (newServiceCodeId) {
      var deferred = $q.defer();

      if ($scope.currentServiceCode.ServiceCodeId == newServiceCodeId) {
        deferred.resolve($scope.currentServiceCode);
      } else if (
        $scope.nextSmartCode &&
        $scope.nextSmartCode.ServiceCodeId == newServiceCodeId
      ) {
        deferred.resolve($scope.nextSmartCode);
      } else {
        referenceDataService
          .getData(referenceDataService.entityNames.serviceCodes)
          .then(function (serviceCodes) {
            if (!_.isEmpty(serviceCodes)) {
              deferred.resolve(
                _.find(serviceCodes, { ServiceCodeId: newServiceCodeId })
              );
            } else {
              deferred.resolve(null);
            }
          });
      }

      return deferred.promise.then(tempServiceCode => {
        if (newServiceCodeId && $scope.serviceTransaction) {
          $scope.serviceTransaction.ServiceCodeId = newServiceCodeId;
          $scope.serviceTransaction.CdtCodeName = tempServiceCode.CdtCodeName;
          $scope.serviceTransaction.Code = tempServiceCode.Code;
          $scope.serviceTransaction.AffectedAreaId =
            tempServiceCode.AffectedAreaId;
          $scope.serviceTransaction.Description = tempServiceCode.Description;
          $scope.serviceTransaction.CompleteDescription =
            tempServiceCode.Description;
          if (
            tempServiceCode.CdtCodeName !== null &&
            tempServiceCode.CdtCodeName !== '' &&
            tempServiceCode.CdtCodeName !== undefined
          )
            $scope.serviceTransaction.CompleteDescription =
              tempServiceCode.Description +
              ' (' +
              tempServiceCode.CdtCodeName +
              ')';
          $scope.serviceTransaction.DisplayAs = tempServiceCode.DisplayAs;
        }
      });
    };

    // disable locations and status if tx plan
    ctrl.setLocationDisabled = function () {
      if (
        ($scope.serviceTransaction &&
          $scope.serviceTransaction.TreatmentPlanId) ||
        $scope.isNewTreatmentPlan
      ) {
        $scope.locationsDisabled = true;
      }
    };

    //#region

    //#region kendo window title change

    // handles smart code title for anterior and posterior teeth
    ctrl.appendKendoWindowTitle = function (previousCode, newCode) {
      if (_.isEmpty(newCode)) {
        return;
      }
      // create new title
      _.forEach($scope.windowTitles, function (windowTitle) {
        if (!_.isEmpty(windowTitle.textContent)) {
          // change title to match new smart code choices
          var originalTitle = windowTitle.textContent;

          if (!originalTitle.includes(newCode.Code)) {
            windowTitle.innerHTML = originalTitle.replace(
              previousCode.Code,
              newCode.Code
            );
          }
        }
      });
    };

    //#endregion

    /**
     * look up service code based on serviceCodeId if we have serviceCodes
     *
     * @param {*} serviceCodeId
     * @returns {angular.IPromise}
     */
    function loadServiceCodeById(serviceCodeId) {
      return referenceDataService
        .getData(referenceDataService.entityNames.serviceCodes)
        .then(function (serviceCodes) {
          var serviceCode = _.find(serviceCodes, {
            ServiceCodeId: serviceCodeId,
          });
          if (!_.isEmpty(serviceCode)) {
            ctrl.success(serviceCode);
            return;
          }

          // fallback
          var service = _.find(ctrl.serviceCodes, {
            ServiceCodeId: $scope.buttonId,
          });
          if (!_.isNil(service)) {
            ctrl.success(service);
          }
        });
    }

    // Reset the patient info if changes are made in the factory
    $scope.setPatientData = function (patientInfo) {
      $scope.patientInfo = patientInfo;
      if (!$scope.isEdit) {
        $scope.checkPatientLocation();
      }
    };

    // Check to ensure the patient is active at the current location in the app header
    $scope.checkPatientLocation = function () {
      var currentLocation = locationService.getCurrentLocation();
      $scope.patientLocationMatch = patientValidationFactory.CheckPatientLocation(
        $scope.patientInfo,
        currentLocation
      );
    };

    $scope.setSmartCodeGroup = function () {
      if (
        $scope.currentServiceCode &&
        $scope.currentServiceCode.UseSmartCodes
      ) {
        for (var i = 1; i <= 5; i++) {
          var smartCode = 'SmartCode' + i + 'Id';
          $scope.smartCodeGroup.push($scope.currentServiceCode[smartCode]);
        }
      }
    };

    $scope.$on('$destroy', function () {
      removeListenerCurrentcode();
    });

    // Get the correct smart code for Range of Teeth
    $scope.getRoTSmartCode = function () {
      var arches = [];
      _.forEach($scope.activeTeeth, function (tooth) {
        if (tooth.indexOf('-')) {
          var toothRange = tooth.split('-');
          arches = $scope.checkRange(toothRange, arches);
        } else {
          arches = $scope.checkRange(tooth, arches);
        }
      });
      var archesValid =
        arches.length > 0
          ? arches.every(function (val, i, arches) {
              return val === arches[0];
            })
          : false;
      $scope.setRoTSmartCode(archesValid, arches[0]);
    };

    // Call to the getNextSmartCode function with the correct number of selections
    $scope.setRoTSmartCode = function (archesValid, arch) {
      if (arch) {
        if (archesValid && arch == 'Upper') {
          ctrl.getNextSmartCode([1]);
        } else if (archesValid && arch == 'Lower') {
          ctrl.getNextSmartCode([1, 2]);
        } else {
          ctrl.getNextSmartCode([]);
        }
      } else {
        ctrl.getNextSmartCode([]);
      }
    };

    // Check selected teeth against the tooth definitions and get the arches
    $scope.checkRange = function (toothRange, arches) {
      var tooth = {};
      var toothRangeSize = _.size(toothRange);
      if (toothRangeSize > 1) {
        var toothRangeParsed = parseInt(toothRange[0]);
        if (!isNaN(toothRangeParsed)) {
          //It parsed to Int correctly. Parse the toothRange array
          for (var index = 0; index < toothRange.length; index++) {
            toothRange[index] = parseInt(toothRange[index]);
          }
        }

        for (var i = toothRange[0]; i <= toothRange[1]; i++) {
          tooth = listHelper.findItemByFieldValue(
            $scope.teethDefinitions.Teeth,
            'USNumber',
            i.toString()
          );
          if (tooth) {
            arches.push(tooth.ArchPosition);
          }
        }
      } else if (toothRangeSize === 1) {
        tooth = listHelper.findItemByFieldValue(
          $scope.teethDefinitions.Teeth,
          'USNumber',
          toothRange[0].toString()
        );
        if (tooth) {
          arches.push(tooth.ArchPosition);
        }
      }
      return arches;
    };
    $scope.updateProviderId = function (providerId) {
      $scope.serviceTransaction.ProviderUserId = providerId;
      $scope.$apply();
    };

    ctrl.init();
  }
  ProposedServiceCreateUpdateController.prototype = Object.create(BaseCtrl);
})();
