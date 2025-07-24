'use strict';

angular
  .module('common.controllers')
  .controller('ServicesSelectorController', [
    '$scope',
    '$timeout',
    '$filter',
    '$rootScope',
    '$anchorScroll',
    'localize',
    'toastrFactory',
    'patSecurityService',
    'referenceDataService',
    'UserServices',
    'ListHelper',
    'SaveStates',
    '$animate',
    'soarAnimation',
    'PatientServices',
    'StaticData',
    'FinancialService',
    'SurfaceHelper',
    'RootHelper',
    'ShareData',
    'UsersFactory',
    '$location',
    'ServiceTypesService',
    'FeatureFlagService',
    'FuseFlag',
    ServicesSelectorController,
  ]);
function ServicesSelectorController(
  $scope,
  $timeout,
  $filter,
  $rootScope,
  $anchorScroll,
  localize,
  toastrFactory,
  patSecurityService,
  referenceDataService,
  userServices,
  listHelper,
  saveStates,
  $animate,
  soarAnimation,
  patientServices,
  staticData,
  financialService,
  surfaceHelper,
  rootHelper,
  shareData,
  usersFactory,
  $location,
  serviceTypesService,
  featureFlagService,
  fuseFlag,
) {
  BaseCtrl.call(this, $scope, 'ServicesSelectorController');

  var ctrl = this;
  ctrl.kendoWidgets = [];

  $scope.soarAuthEnctrAddSvcKey = 'soar-acct-enctr-asvcs';

  $scope.$on('kendoWidgetCreated', function (event, widget) {
    ctrl.kendoWidgets.push(widget);
    var element = widget.element;

    if (
      widget.ns == '.kendoComboBox' &&
      element.attr('id').indexOf('lstProvider') > -1
    ) {
      widget.list.width(200);
    }
  });

  $scope.filterItem = '';
  $scope.validateFlag = false;
  $scope.selectedProviderId = null;
  $scope.activeIndex = -1;
  $scope.serviceTransactionsInitial = [];
  $scope.editMode = false;
  $scope.addButtonText = localize.getLocalizedString('Add');
  $scope.loadingServices = true;
  $scope.filteringServices = false;
  $scope.filteringMessageNoResults = localize.getLocalizedString(
    'There are no {0} that match the filter.',
    ['services']
  );
  $scope.loadingMessageNoResults = localize.getLocalizedString(
    'There are no {0}.',
    ['services']
  );
  $scope.isSurfaceOpen = false;
  $scope.isRootOpen = false;
  $scope.isSaveButtonclicked = false;

  // create new property to hold description + (cdt-code)
  ctrl.setDescriptionOfServiceCode = function () {
    angular.forEach($scope.serviceCodes, function (code) {
      if (
        typeof code.CdtCodeName !== 'undefined' &&
        code.CdtCodeName != null &&
        code.CdtCodeName.length > 0
      ) {
        code.CompleteDescription =
          code.Description + ' (' + code.CdtCodeName + ')';
      } else {
        code.CompleteDescription = code.Description;
      }
    });
  };

  //Initialize serviceTransactions
  $scope.initializeServiceTransactions = function () {
    if ($scope.serviceTransactions && $scope.serviceTransactions.length > 0) {
      var selected = { Selected: true };
      var objectState = { ObjectState: saveStates.Update };
      angular.forEach(
        $scope.serviceTransactions,
        function (serviceTransaction) {
          $.extend(true, serviceTransaction, selected);
          $.extend(true, serviceTransaction, objectState);
        }
      );

      $scope.serviceTransactionsInitial = angular.copy(
        $scope.serviceTransactions
      );

      $scope.editMode = true;
      $scope.validateFlag = false;
      $scope.addButtonText = localize.getLocalizedString('Save');
    } else {
      $scope.serviceTransactions = [];
    }
  };
  $scope.initializeServiceTransactions();

  $scope.now = moment();
  // Note- dateToday is calculated because earlier approach of sending utc date to datepicker was giving wrong date.
  // Example- if utc is for 28th May then DatePicker was showing 27th May
  ctrl.dateToday = new Date();

  $scope.serviceTransactionMaxDate = $scope.maxDate
    ? $scope.maxDate
    : moment([
        $scope.now.year(),
        $scope.now.month(),
        $scope.now.date(),
        0,
        0,
        0,
        0,
      ]);
  $scope.serviceTransactionMinDate = $scope.minDate
    ? $scope.minDate
    : moment().add(-100, 'years').startOf('day').toDate();

  //Success callback to load current patient
  ctrl.getPatientSuccess = function (successResponse) {
    $scope.currentPatient = successResponse.Value;
  };

  //Error callback to load current patient
  ctrl.getPatientFailure = function (errorResponse) {
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the current patient. Refresh the page to try again.'
      ),
      localize.getLocalizedString('Server Error')
    );
  };

  //Get current patient by person id
  ctrl.getCurrentPatient = function () {
    patientServices.Patient.Operations.Retrieve(
      { PatientId: $scope.personId },
      ctrl.getPatientSuccess,
      ctrl.getPatientFailure
    );
  };

  //Get current patient data if the data does not exists
  if (!$scope.currentPatient && $scope.personId) ctrl.getCurrentPatient();

  //Success callback to load service codes list
  $scope.serviceCodes = [];

  // gets all the providers
  $scope.getPracticeProviders = function () {
    if (shareData.allProviders && shareData.allProviders.length > 0) {
      $scope.userServicesGetSuccess({ Value: shareData.allProviders });
    } else {
      $scope.loading = true;
      usersFactory
        .Users()
        .then($scope.userServicesGetSuccess, $scope.userServicesGetFailure);
    }
  };

  //Success handler for get provider service
  $scope.userServicesGetSuccess = function (res) {
    $scope.loading = false;
    $scope.providers = [];
    $scope.providers = res.Value;
  };

  //Failure handler for get provider service
  $scope.userServicesGetFailure = function () {
    $scope.loading = false;
    $scope.providers = [];
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the list of providers. Refresh the page to try again.'
      ),
      localize.getLocalizedString('Server Error')
    );
  };

  $scope.getPracticeProviders();

  //Custom filter - filter based on the service type selected
  $scope.serviceTypeFilter = function (data) {
    if (data.ServiceTypeId === $scope.filterItem) {
      return true;
    } else if ($scope.filterItem == null || $scope.filterItem == '') {
      return true;
    } else {
      return false;
    }
  };

  $scope.serviceCodes =
    $scope.codes != null && $scope.codes.length > 0
      ? angular.copy($scope.codes)
      : [];

  // call function to set new property to hold description + (cdt-code)
  ctrl.setDescriptionOfServiceCode();

  //Get service codes depending on the editMode flag value
  if (!$scope.editMode && _.isEmpty($scope.serviceCodes)) {
    $scope.loadingServices = false;
    $scope.serviceCodes = referenceDataService.get(
      referenceDataService.entityNames.serviceCodes
    );
    // call function to set new property to hold description + (cdt-code)
    ctrl.setDescriptionOfServiceCode();
    $scope.codes = _.cloneDeep($scope.serviceCodes);
  } else if ($scope.editMode) {
    $scope.loadingServices = false;
    var serviceCodes = referenceDataService.get(
      referenceDataService.entityNames.serviceCodes
    );
    var serviceCode = _.find(serviceCodes, {
      ServiceCodeId: $scope.serviceTransactions[0].ServiceCodeId,
    });
    if (_.isNil(serviceCode)) {
      //$scope.serviceCode = successResponse.Value;
      $scope.serviceCodes.push(serviceCode);
      $scope.activeIndex = 0;
    }
  }

  $scope.serviceTypes = [];
  serviceTypesService.getAll()
    .then(function (serviceTypes) {
      $scope.serviceTypes = serviceTypes;
    });

  //load teeth definitions
  ctrl.getTeethDefinitions = function () {
    staticData.TeethDefinitions().then(function (res) {
      if (res && res.Value && res.Value.Teeth) {
        $scope.allTeeth = res.Value.Teeth;
      }
    });
  };
  ctrl.getTeethDefinitions();

  //validate tooth
  ctrl.validateServiceCodeTooth = function (serviceTransaction) {
    if (serviceTransaction.AffectedAreaId == 1) {
      return true;
    } else if (serviceTransaction.AffectedAreaId != 2) {
      var tooth = listHelper.findItemByFieldValue(
        $scope.allTeeth,
        'USNumber',
        serviceTransaction.Tooth
      );
      if (tooth) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  };

  // validate service transaction instance
  ctrl.serviceTransactionIsValid = function (serviceTransaction) {
    ctrl.elementIndex++;
    serviceTransaction.invalidTooth = false;
    var isValidDate =
      angular.isDefined(serviceTransaction.DateEntered) &&
      serviceTransaction.ValidDate;
    var isValidTooth =
      serviceTransaction.AffectedAreaId == 1 ||
      (serviceTransaction.Tooth > '' &&
        ctrl.validateServiceCodeTooth(serviceTransaction));
    var isValidSurface =
      serviceTransaction.AffectedAreaId != 4 ||
      (serviceTransaction.Surface > '' &&
        ctrl.validateServiceCodeSurface(serviceTransaction));
    var isValidRoot =
      serviceTransaction.AffectedAreaId != 3 ||
      (serviceTransaction.Roots > '' &&
        ctrl.validateServiceCodeRoot(serviceTransaction));
    var isValidProvider =
      $scope.hideProvider || serviceTransaction.ProviderUserId > '';
    var isValidFee =
      serviceTransaction.Fee == undefined ||
      serviceTransaction.Fee == null ||
      (serviceTransaction.Fee >= 0 && serviceTransaction.Fee <= 999999.99);
    if (!isValidDate) {
      $timeout(function () {
        angular
          .element('#inpServiceCodeDate' + ctrl.elementIndex)
          .find('input')
          .focus();
      }, 0);
      return false;
    }
    if (!isValidTooth) {
      $timeout(function () {
        serviceTransaction.invalidTooth = true;
        angular.element('#inpTooth' + ctrl.elementIndex).focus();
      }, 0);
      return false;
    }
    if (!isValidSurface) {
      $timeout(function () {
        serviceTransaction.invalidSurface = true;
        angular.element('#inpSurface' + ctrl.elementIndex).focus();
      }, 0);
      return false;
    }
    if (!isValidRoot) {
      $timeout(function () {
        serviceTransaction.invalidRoot = true;
        angular.element('#inpRoot' + ctrl.elementIndex).focus();
      }, 0);
      return false;
    }
    if (!isValidProvider) {
      $timeout(function () {
        angular
          .element('#lstProvider' + ctrl.elementIndex)
          .find('span')
          .focus();
      }, 0);
      return false;
    }
    if (!isValidFee) {
      $timeout(function () {
        angular.element('#inpFee' + ctrl.elementIndex).focus();
      }, 0);
      return false;
    }
    return true;
  };

  //Add service to the selected service list if it is valid
  $scope.onAddServices = function (e) {
    if (
      patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthEnctrAddSvcKey
      )
    ) {
      $scope.validateFlag = true;
      $scope.isSaveButtonclicked = true;
      ctrl.elementIndex = -1;
      var isValid = true;
      var validatedServiceTransactions = [];
      var selectedCount = 0;
      angular.forEach(
        $scope.serviceTransactions,
        function (serviceTransaction) {
          if (serviceTransaction.Selected) {
            if (isValid) {
              serviceTransaction.invalidTooth = false;
              // Disable this check for now. Looks like something for future validation.
              //isValid = ctrl.serviceTransactionIsValid(serviceTransaction);
              validatedServiceTransactions.push(serviceTransaction);
            }
            ++selectedCount;
          } else {
            // increment index pointer to accurately focus on invalid field when there are few middle services marked as unchecked
            ctrl.elementIndex++;
          }
        }
      );
      if (isValid && validatedServiceTransactions.length === selectedCount) {
        // #region animate
        //add animation class to the tab
        soarAnimation.soarFlashBG(e.currentTarget, '.service-list-item');
        soarAnimation.soarFlashBG(ctrl.tabCtrl);

        $scope.onAdd(validatedServiceTransactions);
        $scope.clearAndCloseSelectedRow();
      }
    } else {
      //toastrFactory.error('User is not authorized to access this area.', 'Not Authorized');
      toastrFactory.error(
        patSecurityService.generateMessage($scope.soarAuthEnctrAddSvcKey),
        'Not Authorized'
      );
      $location.path('/');
    }
    $scope.isSaveButtonclicked = false;
  };

  $scope.$on('appointment:update-appointment', function () {
    $scope.serviceTransactions = [];
    $('input:checkbox.service-code-select').removeAttr('checked');
  });

  //Keep count of services selected
  $scope.selectedCount = function () {
    ctrl.count = 0;
    angular.forEach($scope.serviceTransactions, function (serviceTransaction) {
      if (serviceTransaction.Selected) ctrl.count++;
    });
    return ctrl.count;
  };

  //Open row in edit mode.
  $scope.activateRow = function (index) {
    //read tab to animate
    ctrl.tabCtrl = angular.element('#tabViewEncounter');

    //Read service row being added to view tab and need to be animated
    ctrl.activeServiceRow = angular.element('#trServiceRow' + index);
    $scope.toothFirst = false;
    $scope.validateFlag = false;
    if (
      index > -1 &&
      index < $scope.filteredServiceCodes.length &&
      $scope.activeIndex != index
    ) {
      $scope.activeIndex = index;
      $scope.loadServiceTransactions($scope.filteredServiceCodes[index]);
    } else {
      $scope.activeIndex = -1;
      $scope.loadServiceTransactions(null);
    }

    angular.forEach($scope.serviceTransactions, function (serviceTransaction) {
      var service = listHelper.findItemByFieldValue(
        $scope.serviceCodes,
        'ServiceCodeId',
        serviceTransaction.ServiceCodeId
      );
      if (service != null) {
        serviceTransaction.CompleteDescription = service.Description;
        // add not empty cdt code to description for service codes of swift pick code
        if (
          service.CdtCodeName != null &&
          service.CdtCodeName != '' &&
          service.CdtCodeName != undefined
        )
          serviceTransaction.CompleteDescription =
            service.Description + ' (' + service.CdtCodeName + ')';
      }
    });

    $scope.serviceTransactionsInitial = angular.copy(
      $scope.serviceTransactions
    );
    $scope.setInitialFocusOnControls();
  };

  //prepare the servicecode to add it in the encounter
  $scope.loadServiceTransactions = function (serviceCode) {
    $scope.serviceTransactions = [];

    if (serviceCode && serviceCode.IsSwiftPickCode) {
      angular.forEach(
        serviceCode.SwiftPickServiceCodes,
        function (swiftPickServiceCode) {
          // get respective service code for the swiftpick service code
          var service = listHelper.findItemByFieldValue(
            $scope.serviceCodes,
            'ServiceCodeId',
            swiftPickServiceCode.ServiceCodeId
          );
          if (service != null) {
            // add service code under swift pick code
            $scope.addToServiceTransactions(service);
          }
        }
      );
    } else {
      $scope.addToServiceTransactions(serviceCode);
    }
  };

  //add the service in the servicetransaction
  $scope.addToServiceTransactions = function (serviceCode) {
    if (serviceCode) {
      serviceCode.ObjectState = saveStates.Add;
      if ($scope.currentPatient && $scope.appointment)
        $scope.appointment.Patient = $scope.currentPatient;
      $scope.serviceTransactions.push(
        $scope.ServiceTransaction(
          serviceCode,
          $scope.appointment,
          $scope.appointmentType
        )
      );
    }
  };

  // set initial focus on the control
  $scope.setInitialFocusOnControls = function () {
    var elementIndex = -1;
    var isFocusSet = false;

    angular.forEach($scope.serviceTransactions, function (serviceTransaction) {
      if (serviceTransaction.Selected && !isFocusSet) {
        elementIndex++;

        var shouldFocusOnTooth = !(
          serviceTransaction.AffectedAreaId == 1 || serviceTransaction.Tooth
        );
        var shouldFocusOnProvider = !(
          $scope.hideProvider || serviceTransaction.ProviderUserId
        );
        var shouldFocusOnFee = !serviceTransaction.Fee;

        if (shouldFocusOnTooth) {
          $timeout(function () {
            angular.element('#inpTooth' + elementIndex).focus();
          }, 200);
          isFocusSet = true;
        } else if (shouldFocusOnProvider) {
          $timeout(function () {
            angular
              .element('#lstProvider' + elementIndex)
              .find('span')
              .focus();
          }, 200);
          isFocusSet = true;
        } else if (shouldFocusOnFee) {
          $timeout(function () {
            angular.element('#inpFee' + elementIndex).focus();
          }, 200);
          isFocusSet = true;
        }
      }
    });
  };

  // clear the active index for clearing the expanded row
  $scope.clearAndCloseSelectedRow = function () {
    $scope.filteringServices = true;
    $scope.activeIndex = -1;
  };

  // validate surface
  $scope.validateSurface = function (serviceTransaction, flag) {
    serviceTransaction.isSurfaceEditing = true;
  };

  $scope.blurSurface = function (serviceTransaction) {
    serviceTransaction.isSurfaceEditing = false;
    var selectedTooth = serviceTransaction.Tooth;
    var tooth = listHelper.findItemByFieldValue(
      $scope.allTeeth,
      'USNumber',
      selectedTooth
    );
    if (tooth) {
      if (serviceTransaction.Tooth.length > 0 && !serviceTransaction.Surface) {
        $scope.validateFlag = true;
      }
      ctrl.setValidSelectedSurfaces(
        serviceTransaction,
        tooth.SummarySurfaceAbbreviations,
        true
      );
    }
  };

  //load teeth definitions
  ctrl.getTeethDefinitions = function () {
    staticData.TeethDefinitions().then(function (res) {
      if (res && res.Value && res.Value.Teeth) {
        $scope.allTeeth = res.Value.Teeth;
      }
    });
  };
  ctrl.getTeethDefinitions();

  //validate tooth
  ctrl.validateServiceTransactionTooth = function (serviceTransaction) {
    if (serviceTransaction.AffectedAreaId == 1) {
      return true;
    } else if (serviceTransaction.AffectedAreaId != 2) {
      var tooth = listHelper.findItemByFieldValue(
        $scope.allTeeth,
        'USNumber',
        serviceTransaction.Tooth
      );
      if (tooth) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  };

  ctrl.setValidSelectedSurfaces = function (
    serviceTransaction,
    summarySurfaces,
    flag
  ) {
    return surfaceHelper.setValidSelectedSurfaces(
      serviceTransaction,
      summarySurfaces,
      flag
    );
  };

  ctrl.validateServiceCodeSurface = function (serviceTransaction) {
    if (serviceTransaction) {
      var selectedTooth = serviceTransaction.Tooth;
      var tooth = listHelper.findItemByFieldValue(
        $scope.allTeeth,
        'USNumber',
        selectedTooth
      );
      if (tooth) {
        return ctrl.setValidSelectedSurfaces(
          serviceTransaction,
          tooth.SummarySurfaceAbbreviations,
          false
        );
      }
      return true;
    }
    return true;
  };

  ctrl.validateServiceCodeRoot = function (serviceTransaction) {
    if (serviceTransaction) {
      var selectedTooth = serviceTransaction.Tooth;
      var tooth = listHelper.findItemByFieldValue(
        $scope.allTeeth,
        'USNumber',
        selectedTooth
      );
      if (tooth) {
        return ctrl.setValidSelectedRoots(
          serviceTransaction,
          tooth.RootAbbreviations,
          $scope.isSaveButtonclicked
        );
      }
      return true;
    }
    return true;
  };

  ctrl.setValidSelectedRoots = function (
    serviceTransaction,
    RootAbbreviations,
    isSaveButtonclicked
  ) {
    return rootHelper.setValidSelectedRoots(
      serviceTransaction,
      RootAbbreviations,
      isSaveButtonclicked
    );
  };

  //validate tooth data
  $scope.validateTooth = function (serviceTransaction, isSurface) {
    if (serviceTransaction) {
      serviceTransaction.Tooth = serviceTransaction.Tooth
        ? serviceTransaction.Tooth.replace(/^0+/, '').toUpperCase()
        : serviceTransaction.Tooth;
      if (serviceTransaction.AffectedAreaId != 2)
        serviceTransaction.Tooth = serviceTransaction.Tooth
          ? serviceTransaction.Tooth.replace(/[^A-T0-9]/gi, '')
          : serviceTransaction.Tooth;
      else
        serviceTransaction.Tooth = serviceTransaction.Tooth
          ? serviceTransaction.Tooth.replace(/[^UR|UL|LR|LL]/gi, '')
          : serviceTransaction.Tooth;
    }
    if (
      angular.isDefined(serviceTransaction.AffectedAreaId) &&
      (serviceTransaction.AffectedAreaId == 4 ||
        serviceTransaction.AffectedAreaId == 3)
    ) {
      if (angular.isDefined(serviceTransaction.Tooth)) {
        if (serviceTransaction.Tooth.length <= 0 && isSurface) {
          serviceTransaction.ToothFirst = true;
        } else {
          serviceTransaction.ToothFirst = false;
        }
      } else {
        if (serviceTransaction.AffectedAreaId == 4) {
          if (
            angular.isDefined(serviceTransaction.Surface) &&
            serviceTransaction.Surface.length > 0
          ) {
            serviceTransaction.ToothFirst = true;
          } else {
            serviceTransaction.ToothFirst = false;
          }
        } else if (serviceTransaction.AffectedAreaId == 3) {
          if (
            angular.isDefined(serviceTransaction.Roots) &&
            serviceTransaction.Roots.length > 0
          ) {
            serviceTransaction.ToothFirst = true;
          } else {
            serviceTransaction.ToothFirst = false;
          }
        }
      }
      if (angular.isDefined(isSurface)) {
        if (serviceTransaction.ToothFirst) {
          serviceTransaction.Surface = '';
          serviceTransaction.Roots = '';
        }
      }
    } else {
      serviceTransaction.ToothFirst = false;
    }
    serviceTransaction.isSurfaceEditing = true;
    serviceTransaction.invalidTooth = !ctrl.validateServiceCodeTooth(
      serviceTransaction
    );
    serviceTransaction.invalidSurface = !ctrl.validateServiceCodeSurface(
      serviceTransaction
    );
    serviceTransaction.invalidRoot = !ctrl.validateServiceCodeRoot(
      serviceTransaction
    );
  };

  //Watch service code data for any changes
  $scope.$watch(
    'serviceTransactions',
    function () {
      if ($scope.hasDataChanged == false) {
        $scope.serviceTransactions.forEach(function (service) {
          var nomatches = $scope.serviceTransactionsInitial.filter(function (
            f
          ) {
            return (
              f.ProviderId == service.ProviderId &&
              (f.DateEntered ? f.DateEntered.toLocaleDateString : '') ==
                (service.DateEntered
                  ? service.DateEntered.toLocaleDateString
                  : '') &&
              (f.Tooth != undefined ? f.Tooth.toLowerCase() : '') ==
                (service.Tooth != undefined
                  ? service.Tooth.toLowerCase()
                  : '') &&
              (f.Surface != undefined ? f.Surface.toLowerCase() : '') ==
                (service.Surface != undefined
                  ? service.Surface.toLowerCase()
                  : '') &&
              (f.Root != undefined ? f.Root.toLowerCase() : '') ==
                (service.Root != undefined ? service.Root.toLowerCase() : '') &&
              f.Fee == service.Fee
            );
          });
          $scope.hasDataChanged = nomatches.length ? false : true;
        });
      }
    },
    true
  );

  //watch default date
  $scope.$watch('defaultDate', function (nv, ov) {
    if (nv && nv != ov) {
      if (!$scope.editableDate) {
        // This is not the estimated date to be completed. This is the date that the office says that they planned a particular service.
        // With the being the case, the date should never be greater than today; however, we could have planned in the past and forgot to enter it.
        var datePlanned = nv >= ctrl.dateToday ? ctrl.dateToday : nv;

        angular.forEach($scope.serviceTransactions, function (item) {
          item.DateEntered = datePlanned;
        });
      }
    }
  });

  ctrl.getDefaultProviderIdForServiceCode = function (
    serviceCode,
    appointment,
    appointmentType
  ) {
    if (serviceCode != null && appointment != null) {
      var providerOnAppointment =
        appointment.ProviderAppointments != null &&
        appointment.ProviderAppointments.length > 0
          ? appointment.ProviderAppointments[0].UserId
          : null;
      var examiningDentist = appointment.ExaminingDentist;

      var hasAppointmentType = appointmentType != null;
      var serviceCodePerformedByHygienist =
        serviceCode.UsuallyPerformedByProviderTypeId == 2;
      var serviceCodePerformedByDentist =
        serviceCode.UsuallyPerformedByProviderTypeId == 1;

      if (hasAppointmentType) {
        var isHygieneAppointment =
          appointmentType.PerformedByProviderTypeId == 2;
        var isRegularAppointment =
          appointmentType.PerformedByProviderTypeId == 1;

        if (isHygieneAppointment) {
          if (serviceCodePerformedByHygienist) {
            return providerOnAppointment;
          } else if (serviceCodePerformedByDentist) {
            return examiningDentist;
          } else {
            return null;
          }
        } else if (isRegularAppointment) {
          if (serviceCodePerformedByHygienist) {
            return null;
          } else if (serviceCodePerformedByDentist) {
            return providerOnAppointment;
          } else {
            return providerOnAppointment;
          }
        } else {
          return providerOnAppointment;
        }
      } else {
        return providerOnAppointment;
      }
    } else if (
      serviceCode != null &&
      appointment == null &&
      $scope.currentPatient
    ) {
      //For encounter services
      if (
        serviceCode.UsuallyPerformedByProviderTypeId == 1 &&
        $scope.currentPatient.PreferredDentist
      ) {
        //If service is usually performed by dentist and the preferred dentist for a patient exists, set the provider user id for the service to preferred dentist
        return $scope.currentPatient.PreferredDentist;
      } else if (
        serviceCode.UsuallyPerformedByProviderTypeId == 2 &&
        $scope.currentPatient.PreferredHygienist
      ) {
        //If service is usually performed by hygienist and the preferred hygienist for a patient exists, set the provider user id for the service to preferred dentist
        return $scope.currentPatient.PreferredHygienist;
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  ctrl.getAccountMemberId = function (serviceCode, appointment) {
    if (appointment != null) {
      if (appointment.Patient)
        var AccountMemberId =
          appointment.Patient.PersonAccount.PersonAccountMember.AccountMemberId;
      if (AccountMemberId) return AccountMemberId;
      else return appointment.PersonId;
    } else if (serviceCode != null) {
      return serviceCode.AccountMemberId;
    } else {
      return null;
    }
  };

  $scope.populateSelectedSurface = function (surface) {
    $scope.isSurfaceOpen = true;
    return surface;
  };

  $scope.close = function () {
    $scope.isSurfaceOpen = false;
  };

  //convert serviceCode into servicetransaction
  $scope.ServiceTransaction = function (
    serviceCode,
    appointment,
    appointmentType
  ) {
    var serviceTransaction = {
      SequenceNumber: 1,
      PersonId: ctrl.PersonId,
      Code: serviceCode ? serviceCode.Code : '',
      DisplayAs: serviceCode
        ? serviceCode.DisplayAs
          ? serviceCode.DisplayAs
          : serviceCode.Code
        : '',
      Description: serviceCode ? serviceCode.Description : '',
      CdtCodeName: serviceCode ? serviceCode.CdtCodeName : '',
      ServiceTypeDescription: serviceCode
        ? serviceCode.ServiceTypeDescription
        : '',
      ServiceCodeId: serviceCode ? serviceCode.ServiceCodeId : '',
      DateEntered:
        $scope.defaultDate == null || $scope.defaultDate >= ctrl.dateToday
          ? ctrl.dateToday
          : $scope.defaultDate,
      EnteredByUserId: null,
      ServiceTransactionStatusId: 1,
      AccountMemberId: ctrl.getAccountMemberId(serviceCode, appointment),
      TransactionTypeId: 1,
      Note: '',
      AppointmentId: appointment != null ? appointment.AppointmentId : null,
      ProviderUserId: ctrl.getDefaultProviderIdForServiceCode(
        serviceCode,
        appointment,
        appointmentType
      ),
      Surface: '',
      Roots: '',
      Tooth: '',
      AffectedAreaId: serviceCode ? serviceCode.AffectedAreaId : null,
      Fee: serviceCode.$$locationFee
        ? serviceCode.$$locationFee
        : serviceCode.Fee,
      ValidDate: true,
      ToothFirst: false,
      ObjectState: serviceCode
        ? serviceCode.ObjectState
          ? serviceCode.ObjectState
          : saveStates.None
        : '',
      Selected: true,
      TransactionType: serviceCode ? serviceCode.TransactionType : '',
      UsuallyPerformedByProviderTypeId: serviceCode
        ? serviceCode.UsuallyPerformedByProviderTypeId
        : '',
    };

    serviceTransaction.InsuranceEstimates = financialService.CreateInsuranceEstimateObject(
      serviceTransaction
    );

    return serviceTransaction;
  };

  $scope.serviceSelected = function (checked, serviceCode) {
    if (checked) {
      $scope.addToServiceTransactions(serviceCode);
    } else {
      var index = -1;

      for (var i = 0; i < $scope.serviceTransactions.length; i++) {
        if (
          $scope.serviceTransactions[i].ServiceCodeId ===
          serviceCode.ServiceCodeId
        ) {
          index = i;
          break;
        }
      }
      if (index > -1) {
        $scope.serviceTransactions.splice(index, 1);
      }
    }
  };

  //#region fieldOptions
  ctrl.defaultFieldOptions = {
    ServiceTypeSelector: {
      Disabled: false,
      Hidden: false,
    },
    SearchBoxInput: {
      Disabled: false,
      Hidden: false,
    },
  };

  $scope.fieldOptions = $scope.fieldOptions
    ? $.extend(true, ctrl.defaultFieldOptions, $scope.fieldOptions)
    : ctrl.defaultFieldOptions;
  //#endregion
  $scope.$on('$destroy', function () {
    if (ctrl && ctrl.kendoWidgets && ctrl.kendoWidgets.length) {
      angular.forEach(ctrl.kendoWidgets, function (widget) {
        if (widget) {
          try {
            widget.destroy();
            for (var widgetItem in widget) {
              if (widgetItem && widget.hasOwnProperty(widgetItem)) {
                widget[widgetItem] = null;
              }
            }
          } catch (err) {
            var test = err;
          }
        }
      });

      ctrl.kendoWidgets = null;
      ctrl = null;
    }
  });
}

ServicesSelectorController.prototype = Object.create(BaseCtrl.prototype);
