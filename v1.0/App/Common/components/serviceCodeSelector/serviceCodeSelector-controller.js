'use strict';

angular
  .module('common.controllers')
  .controller('ServiceCodeSelectorController', [
    '$scope',
    '$timeout',
    '$filter',
    '$rootScope',
    '$location',
    '$anchorScroll',
    'localize',
    'toastrFactory',
    'patSecurityService',
    'referenceDataService',
    'UserServices',
    'ListHelper',
    'SaveStates',
    'UsersFactory',
    'ServiceTypesService',
    'FeatureFlagService',
    'FuseFlag',
    ServiceCodeSelectorController,
  ]);
function ServiceCodeSelectorController(
  $scope,
  $timeout,
  $filter,
  $rootScope,
  $location,
  $anchorScroll,
  localize,
  toastrFactory,
  patSecurityService,
  referenceDataService,
  userServices,
  listHelper,
  saveStates,
  usersFactory,
  serviceTypesService,
  featureFlagService,
  fuseFlag,
) {
  BaseCtrl.call(this, $scope, 'ServiceCodeSelectorController');

  var ctrl = this;
  ctrl.kendoWidgets = [];
  // adjust combobox result-list width
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
  $scope.plannedServicesInitial = [];
  $scope.editMode = false;
  $scope.addButtonText = localize.getLocalizedString('Add');
  $scope.loadingServices = true;
  $scope.filteringServices = false;
  $scope.filteringMessageNoResults = localize.getLocalizedString(
    'There are no {0} that match the filter.',
    ['service codes']
  );
  $scope.loadingMessageNoResults = localize.getLocalizedString(
    'There are no {0}.',
    ['service codes']
  );

  // initialize plannedservices
  $scope.initializePlannedServices = function () {
    if ($scope.plannedServices && $scope.plannedServices.length > 0) {
      var selected = { Selected: true };
      angular.forEach($scope.plannedServices, function (plannedService) {
        $.extend(true, plannedService, selected);
      });
      $scope.plannedServicesInitial = angular.copy($scope.plannedServices);

      $scope.editMode = true;
      $scope.validateFlag = false;
      $scope.addButtonText = localize.getLocalizedString('Save');
    } else {
      $scope.plannedServices = [];
    }
  };
  $scope.initializePlannedServices();

  $scope.now = moment();
  // Note- dateToday is calcuted because earlier approach of sending utc date to datepicker was giving wrong date.
  // Example- if utc is for 28th May then DatePicker was showing 27th May
  ctrl.dateToday =
    $scope.now.month() + 1 + '/' + $scope.now.date() + '/' + $scope.now.year();
  $scope.plannedServiceMaxDate = $scope.maxDate
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
  $scope.plannedServiceMinDate = $scope.minDate
    ? $scope.minDate
    : moment().add(-100, 'years').startOf('day').toDate();

  //Success callback to load service codes list
  $scope.serviceCodes = [];

  // gets all the providers
  $scope.getPracticeProviders = function () {
    $scope.loading = true;
    usersFactory
      .Users()
      .then($scope.userServicesGetSuccess, $scope.userServicesGetFailure);
  };

  // success handler for get user service
  $scope.userServicesGetSuccess = function (res) {
    $scope.loading = false;
    $scope.providers = [];
    var filterdValue = res.Value.filter(function (f) {
      // Bug - 39089
      // Provider Types - Dentist, Hygienist, Assistant & Other
      if (f.ProviderTypeId) {
        return (
          f.ProviderTypeId == 1 ||
          f.ProviderTypeId == 2 ||
          f.ProviderTypeId == 3 ||
          f.ProviderTypeId == 5
        );
      }
      return false;
    });
    angular.forEach(filterdValue, function (f) {
      $scope.providers.push({
        Name: f.FirstName + ' ' + f.LastName,
        ProviderId: f.UserId,
      });
    });
    $scope.providers = $filter('orderBy')($scope.providers, 'Name');
  };

  // failure handler for get user service
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

  // get service codes depending on editMode value
  if (!$scope.editMode && _.isEmpty($scope.serviceCodes)) {
    $scope.serviceCodes = referenceDataService.get(
      referenceDataService.entityNames.serviceCodes
    );
    $scope.loadingServices = false;
  } else if ($scope.editMode) {
    var serviceCodes = referenceDataService.get(
      referenceDataService.entityNames.serviceCodes
    );
    var serviceCode = _.find(serviceCodes, {
      ServiceCodeId: $scope.plannedServices[0].ServiceCodeId,
    });
    if (!_.isNil(serviceCode)) {
      $scope.serviceCode = serviceCode;
      $scope.serviceCodes.push($scope.serviceCode);
      $scope.loadingServices = false;
      $scope.activeIndex = 0;
    }
  }

  // get service trypes
  $scope.serviceTypes = [];
  serviceTypesService.getAll()
    .then(function (serviceTypes) {
      $scope.serviceTypes = serviceTypes;
    });

  // validate planned service instance
  ctrl.plannedServiceIsValid = function (plannedService) {
    ctrl.elementIndex++;

    var isValidDate =
      angular.isDefined(plannedService.CreationDate) &&
      plannedService.ValidDate;
    var isValidTooth =
      plannedService.AffectedAreaId == 1 || plannedService.Tooth > '';
    var isValidSurface =
      (plannedService.AffectedAreaId != 3 &&
        plannedService.AffectedAreaId != 4) ||
      plannedService.Surface > '';
    var isValidProvider = $scope.hideProvider || plannedService.ProviderId > '';
    var isValidFee =
      plannedService.Fee == undefined ||
      plannedService.Fee == null ||
      (plannedService.Fee >= 0 && plannedService.Fee <= 999999.99);
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
        angular.element('#inpTooth' + ctrl.elementIndex).focus();
      }, 0);
      return false;
    }
    if (!isValidSurface) {
      $timeout(function () {
        angular.element('#inpSurface' + ctrl.elementIndex).focus();
      }, 0);
      return false;
    }
    if (!isValidProvider) {
      $timeout(function () {
        angular
          .element('#lstProvider' + ctrl.elementIndex)
          .data('kendoComboBox')
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

  // add service to encounter
  $scope.onAddServices = function () {
    $scope.validateFlag = true;
    ctrl.elementIndex = -1;
    var isValid = true;
    var validatedPlannedServices = [];
    var selectedCount = 0;
    angular.forEach($scope.plannedServices, function (plannedService) {
      if (plannedService.Selected) {
        if (isValid) {
          isValid = ctrl.plannedServiceIsValid(plannedService);
          validatedPlannedServices.push(plannedService);
        }
        ++selectedCount;
      } else {
        // increment index pointer to accurately focus on invalid field when there are few middle services marked as unchecked
        ctrl.elementIndex++;
      }
    });
    if (isValid && validatedPlannedServices.length === selectedCount) {
      $scope.onAdd(validatedPlannedServices);
      $scope.clearAndCloseSelectedRow();
    }
  };

  // get count of selected services from swift pick code
  $scope.selectedCount = function () {
    ctrl.count = 0;
    angular.forEach($scope.plannedServices, function (plannedService) {
      if (plannedService.Selected) ctrl.count++;
    });
    return ctrl.count;
  };

  // open service in edit mode
  $scope.activateRow = function (index) {
    $scope.toothFirst = false;
    $scope.validateFlag = false;
    if (
      index > -1 &&
      index < $scope.filteredServiceCodes.length &&
      $scope.activeIndex != index
    ) {
      $scope.activeIndex = index;
      $scope.loadPlannedServices($scope.filteredServiceCodes[index]);
    } else {
      $scope.activeIndex = -1;
      $scope.loadPlannedServices(null);
    }
    $scope.plannedServicesInitial = angular.copy($scope.plannedServices);
  };

  // extract individual service so that it can be added to planned service list
  $scope.loadPlannedServices = function (serviceCode) {
    $scope.plannedServices = [];

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
            $scope.addToPlannedServices(service);
          }
        }
      );
    } else {
      $scope.addToPlannedServices(serviceCode);
    }
  };

  // add service to planned service list
  $scope.addToPlannedServices = function (serviceCode) {
    // keep track of objectstate
    serviceCode.ObjectState = saveStates.Add;
    $scope.plannedServices.push(
      $scope.PlannedService(
        serviceCode,
        $scope.appointment,
        $scope.appointmentType
      )
    );
  };

  // clear the active index for clearing the expanded row
  $scope.clearAndCloseSelectedRow = function () {
    $scope.filteringServices = true;
    $scope.activeIndex = -1;
  };

  //validate tooth data
  $scope.validateTooth = function (plannedService, isSurface) {
    if (
      angular.isDefined(plannedService.AffectedAreaId) &&
      (plannedService.AffectedAreaId == 4 || plannedService.AffectedAreaId == 3)
    ) {
      if (angular.isDefined(plannedService.Tooth)) {
        if (plannedService.Tooth.length <= 0 && isSurface) {
          plannedService.ToothFirst = true;
        } else {
          plannedService.ToothFirst = false;
        }
      } else {
        if (
          angular.isDefined(plannedService.Surface) &&
          plannedService.Surface.length > 0
        ) {
          plannedService.ToothFirst = true;
        } else {
          plannedService.ToothFirst = false;
        }
      }
      if (angular.isDefined(isSurface)) {
        if (plannedService.ToothFirst) {
          plannedService.Surface = '';
        }
      }
    } else {
      plannedService.ToothFirst = false;
    }
  };

  //Blur event handler for service type filter field
  $scope.serviceTypeOnBlur = function () {
    if (
      !$scope.fieldOptions.ServiceTypeSelector.Disabled &&
      !$scope.fieldOptions.ServiceTypeSelector.Hidden
    ) {
      var elem = angular.element('#lstServiceType');
      var comboBox = elem.data('kendoComboBox');

      if ($scope.serviceTypes) {
        // Find item by its display text as find by id will not provide proper results if user inputs guid ids.
        var item = listHelper.findItemByFieldValue(
          $scope.serviceTypes,
          'Description',
          comboBox.text()
        );
        if (item == null) {
          // Clear the display value in combobox and its corresponding id
          $scope.filterItem = null;
        }
        $scope.clearAndCloseSelectedRow();
      }
    }
  };

  // handle Change event on service type combo box
  $scope.serviceTypeOnChange = function () {
    if (
      !$scope.fieldOptions.ServiceTypeSelector.Disabled &&
      !$scope.fieldOptions.ServiceTypeSelector.Hidden
    ) {
      var elem = angular.element('#lstServiceType');
      var comboBox = elem.data('kendoComboBox');

      if ($scope.serviceTypes) {
        // Find item by its display text as find by id will not provide proper results if user inputs guid ids.
        var item = listHelper.findItemByFieldValue(
          $scope.serviceTypes,
          'Description',
          comboBox.text()
        );
        if (item == null) {
          // Clear the display value in combobox and its corresponding id
          $scope.filterItem = null;
        }
        $scope.clearAndCloseSelectedRow();
      }
    }
  };

  //Blur event handler for provider input field
  $scope.providerOnBlur = function (e) {
    var elem = angular.element(e.event.target);
    var comboBox = elem.data('kendo-combo-box');

    if ($scope.providers && $scope.providers.length > 0) {
      // Find item by its display text as find by id will not provide proper results if user inputs guid ids.
      var item = listHelper.findItemByFieldValue(
        $scope.providers,
        'Name',
        comboBox.text()
      );
      if (item == null) {
        // Clear the display value in combobox and its corresponding id
        e.plannedService.ProviderId = null;
      }
    }
  };

  //Watch service code data for any changes
  $scope.$watch(
    'plannedServices',
    function () {
      if ($scope.hasDataChanged == false) {
        $scope.plannedServices.forEach(function (service) {
          var nomatches = $scope.plannedServicesInitial.filter(function (f) {
            return (
              f.ProviderId == service.ProviderId &&
              (f.CreationDate ? f.CreationDate.toLocaleDateString : '') ==
                (service.CreationDate
                  ? service.CreationDate.toLocaleDateString
                  : '') &&
              (f.Tooth != undefined ? f.Tooth.toLowerCase() : '') ==
                (service.Tooth != undefined
                  ? service.Tooth.toLowerCase()
                  : '') &&
              (f.Surface != undefined ? f.Surface.toLowerCase() : '') ==
                (service.Surface != undefined
                  ? service.Surface.toLowerCase()
                  : '') &&
              f.Fee == service.Fee
            );
          });
          $scope.hasDataChanged = nomatches.length ? false : true;
        });
      }
    },
    true
  );

  $scope.$watch('defaultDate', function (nv, ov) {
    if (nv && nv != ov) {
      if (!$scope.editableDate) {
        angular.forEach($scope.plannedServices, function (item) {
          item.CreationDate = nv;
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
    } else {
      return null;
    }
  };

  // convert serviceCOde into plannedservice
  $scope.PlannedService = function (serviceCode, appointment, appointmentType) {
    var plannedService = {
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
      CreationDate: $scope.defaultDate ? $scope.defaultDate : ctrl.dateToday,
      CreatedByUserId: null,
      StatusId: 1,
      Note: '',
      AppointmentId: appointment != null ? appointment.AppointmentId : null,
      ProviderId: ctrl.getDefaultProviderIdForServiceCode(
        serviceCode,
        appointment,
        appointmentType
      ),
      Surface: '',
      Tooth: '',
      AffectedAreaId: serviceCode ? serviceCode.AffectedAreaId : null,
      Fee: serviceCode ? serviceCode.Fee : 0.0,
      ValidDate: null,
      ToothFirst: false,
      ObjectState: serviceCode
        ? serviceCode.ObjectState
          ? serviceCode.ObjectState
          : saveStates.None
        : '',
      Selected: true,
    };
    return plannedService;
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
  //#endregion
}

ServiceCodeSelectorController.prototype = Object.create(BaseCtrl.prototype);
