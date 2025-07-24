(function () {
  'use strict';
  angular
    .module('common.controllers')
    .controller(
      'ServiceSelectorRefactorController',
      ServiceSelectorRefactorController
    );

  ServiceSelectorRefactorController.$inject = [
    '$scope',
    '$q',
    'localize',
    'ListHelper',
    'toastrFactory',
    'patSecurityService',
    'PatientValidationFactory',
    'PersonFactory',
    'SaveStates',
    'FinancialService',
    '$timeout',
    'referenceDataService',
    'ServiceTypesService',
    'FeatureFlagService',
    'FuseFlag',
  ];

  function ServiceSelectorRefactorController(
    $scope,
    $q,
    localize,
    listHelper,
    toastrFactory,
    patSecurityService,
    patientValidationFactory,
    personFactory,
    saveStates,
    financialService,
    $timeout,
    referenceDataService,
    serviceTypesService,
    featureFlagService,
    fuseFlag,
  ) {
    BaseCtrl.call(this, $scope, 'ServiceSelectorRefactorController');

    var ctrl = this;
    ctrl.dateToday = new Date();
    ctrl.patientInfo = patientValidationFactory.GetPatientData();
    ctrl.firstLoad = true;
    $scope.selectedServiceCodes = [];
    $scope.disableQuickAdd = false;
    $scope.orderBy = {
      field: '',
      asc: true,
    };

    $scope.serviceCodesFilters = {
      searchServiceCodesKeyword: '',
      allowInactive: false,
    };

    $scope.filteringServices = false;
    $scope.filterServiceList = '';
    ctrl.check = 0;
    $scope.wordCount = 150; // default
    $scope.showInactive = false;
    if ($scope.serviceFilter === 'appointment' && $scope.flyout)
      $scope.wordCount = 65;
    if (
      $scope.serviceFilter === 'encounter' ||
      $scope.serviceFilter === 'encounter-refactored'
    )
      $scope.wordCount = 150;
    if (!$scope.flyout) $scope.wordCount = 80;

    //~~~~~~~~~~~~~~Loading Data~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ctrl.$onInit = function () {
      if (!$scope.flyout) {
        $scope.clearCheckedRows();
        ctrl.initializeServiceCodes();
        ctrl.initializeServiceTypes();
      }

      switch ($scope.serviceFilter) {
        case 'appointment':
          $scope.containerClass = 'newServiceSelectorAppointment';
          $scope.displayMessage = 'Appointment';
          $scope.soarAuthAddSvcKey = 'soar-sch-apt-svcs';
          break;
        case 'encounter-refactored':
        case 'encounter':
          $scope.containerClass = 'newServiceSelectorEncounter';
          $scope.displayMessage = 'Encounter';
          $scope.soarAuthAddSvcKey = 'soar-acct-enctr-asvcs';
          break;
        case 'txplan':
          $scope.containerClass = 'newServiceSelectorTxPlan';
          $scope.displayMessage = 'Treatment Plan';
          $scope.soarAuthAddSvcKey = 'soar-clin-cplan-asvccd';
          break;
      }

      ctrl.loadPatient();
    };

    $scope.$on('openNewServicesFlyout', function (event, sender) {
      ctrl.loadData(sender);
    });

    $scope.$on('closeFlyouts', function () {
      $scope.hideFilters();
    });

    ctrl.loadPatient = function () {
      // sometimes patientInfo hasn't been loaded, set the patientData is none
      if (!ctrl.patientInfo.PatientId && $scope.patient.PatientId) {
        personFactory.Overview($scope.patient.PatientId).then(function (res) {
          ctrl.patientInfo = res.Value;
          patientValidationFactory.SetPatientData(res.Value);
        });
      }
    };

    ctrl.loadData = function (sender) {
      // if broadcast sender matches service filter, or no sender specified, load data
      if ((sender && sender === $scope.serviceFilter) || !sender) {
        if (ctrl.firstLoad) {
          ctrl.firstLoad = false;
          $scope.clearCheckedRows();
          $scope.loadingCheck.loading = true;
          ctrl.initializeServiceTypes();
          ctrl.initializeServiceCodes();
          $timeout(function () {
            if (
              angular.element(
                '.newServiceSelectorAppointment input#searchBoxServiceCodes'
              ).length === 1
            ) {
              angular
                .element(
                  '.newServiceSelectorAppointment input#searchBoxServiceCodes'
                )
                .focus();
            }
            if (
              angular.element(
                '.newServiceSelectorEncounter input#searchBoxServiceCodes'
              ).length === 1
            ) {
              angular
                .element(
                  '.newServiceSelectorEncounter input#searchBoxServiceCodes'
                )
                .focus();
            }
          }, 0);
        } else {
          $scope.showFilters();
          $timeout(function () {
            if (
              angular.element(
                '.newServiceSelectorAppointment input#searchBoxServiceCodes'
              ).length === 1
            ) {
              angular
                .element(
                  '.newServiceSelectorAppointment input#searchBoxServiceCodes'
                )
                .focus();
            }
            if (
              angular.element(
                '.newServiceSelectorEncounter input#searchBoxServiceCodes'
              ).length === 1
            ) {
              angular
                .element(
                  '.newServiceSelectorEncounter input#searchBoxServiceCodes'
                )
                .focus();
            }
          }, 0);
        }
      }
    };
    $scope.loaded = function () {
      if ($scope.loadingCheck && $scope.loadingCheck.loading) {
        ctrl.check++;
        if (ctrl.check >= 2) {
          $scope.loadingCheck.loading = false;
          ctrl.check = 0;
          $scope.showFilters();
        }
      }
    };

    //Lazy loading for the New Service Codes Table
    $scope.limit = 10; // initial value for limit
    $scope.loadMore = function () {
      $scope.limit += 10;
    };

    ctrl.initializeServiceCodes = function () {
      var serviceCodes = referenceDataService.get(
        referenceDataService.entityNames.serviceCodes
      );
      ctrl.serviceCodes = ctrl.mapServiceCodesToVm(serviceCodes);
      $scope.filteredServiceCodes = ctrl.filterServiceCodes(ctrl.serviceCodes);
      $scope.loaded();
    };

    ctrl.mapServiceCodesToVm = function (serviceCodes) {
      var serviceCodesVm = _.map(serviceCodes, function (serviceCode) {
        return {
          ServiceCodeId: serviceCode.ServiceCodeId,
          Code: serviceCode.Code,
          CdtCodeName: serviceCode.CdtCodeName,
          Description: serviceCode.Description,
          ServiceTypeDescription: serviceCode.ServiceTypeDescription,
          $$locationFee: serviceCode.$$locationFee,
          IsActive: serviceCode.IsActive,
          InactivationDate: serviceCode.InactivationDate,
          $$isSelected: false,
        };
      });
      return serviceCodesVm;
    };

    ctrl.filterServiceCodes = function (serviceCodes) {
      // Filter
      var filteredServiceCodes = _.filter(serviceCodes, function (serviceCode) {
        var activeCheck = $scope.allowInactive || serviceCode.IsActive;
        var serviceTypeCheck =
          $scope.filterServiceList === '' ||
          serviceCode.ServiceTypeDescription === $scope.filterServiceList;
        var searchCheck = true;
        if (!_.isEmpty($scope.serviceCodesFilters.searchServiceCodesKeyword)) {
          var searchStrLowerCase = _.toLower(
            $scope.serviceCodesFilters.searchServiceCodesKeyword
          );
          if (
            !_.includes(_.toLower(serviceCode.Code), searchStrLowerCase) &&
            !_.includes(
              _.toLower(serviceCode.CdtCodeName),
              searchStrLowerCase
            ) &&
            !_.includes(
              _.toLower(serviceCode.Description),
              searchStrLowerCase
            ) &&
            !_.includes(
              _.toLower(serviceCode.ServiceTypeDescription),
              searchStrLowerCase
            ) &&
            !_.includes(
              _.toLower(serviceCode.$$locationFee),
              searchStrLowerCase
            )
          ) {
            searchCheck = false;
          }
        }
        return serviceTypeCheck && activeCheck && searchCheck;
      });
      // Sort
      if (!_.isEmpty($scope.orderBy.field)) {
        filteredServiceCodes = _.orderBy(
          filteredServiceCodes,
          $scope.orderBy.field,
          $scope.orderBy.asc ? 'asc' : 'desc'
        );
      }

      return filteredServiceCodes;
    };

    $scope.$watch(
      'serviceCodesFilters.searchServiceCodesKeyword',
      function (nv, ov) {
        if (!_.isEqual(nv, ov)) {
          $scope.limit = 10;
          $scope.filteredServiceCodes = ctrl.filterServiceCodes(
            ctrl.serviceCodes
          );
          if (!_.isEmpty(nv)) {
            $scope.filteringServices = true;
          }
        }
      }
    );

    $scope.filterServiceCodes = function () {
      $scope.filteredServiceCodes = ctrl.filterServiceCodes(ctrl.serviceCodes);
    };

    $scope.serviceCodesEmpty = function () {
      return _.isEmpty($scope.filteredServiceCodes);
    };

    ctrl.initializeServiceTypes = function () {
      serviceTypesService.getAll()
        .then(function (serviceTypes) {
          $scope.serviceTypes = serviceTypes;
          $scope.serviceTypes.push({
            Description: 'Swift Code',
          });
          $scope.loadingServiceTypes = false;
          $scope.loaded();
        });
    };

    //~~~~~~~~~~~~~~Filters/Sorting/Checks~~~~~~~~~~~~~~~~~~~~~~~
    ctrl.serviceTransactionIsValid = function (serviceTransaction) {
      ctrl.elementIndex++;
      serviceTransaction.invalidTooth = false;
      var isValidDate =
        angular.isDefined(serviceTransaction.DateEntered) &&
        serviceTransaction.ValidDate;
      var isValidProvider =
        $scope.hideProvider || serviceTransaction.ProviderUserId > '';
      var isValidFee =
        serviceTransaction.Fee === undefined ||
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
      if (
        !isValidProvider &&
        $scope.serviceFilter !== 'encounter' &&
        $scope.serviceFilter !== 'encounter-refactored'
      ) {
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

    ctrl.showCorrectData = function (service) {
      if (service.DateCompleted == null) {
        if ($scope.serviceFilter === 'appointment') {
          return service.AppointmentId == null;
        } else if (
          $scope.serviceFilter === 'encounter' ||
          $scope.serviceFilter === 'encounter-refactored'
        ) {
          return service.EncounterId == null;
        } else {
          return true;
        }
      } else {
        return false;
      }
    };
    $scope.changeSortingForGrid = function (field) {
      var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
      $scope.orderBy = { field: field, asc: asc };
    };
    $scope.allowInactive = false;
    $scope.filterServiceType = function (code) {
      return (
        (code.ServiceTypeDescription === $scope.filterServiceList ||
          $scope.filterServiceList === '') &&
        ($scope.allowInactive || code.IsActive)
      );
    };
    $scope.changeFilter = function (model) {
      $scope.filterServiceList = model;
      $scope.filterServiceCodes();
    };
    $scope.quickAddStatus = function () {
      return $scope.disableQuickAdd;
    };
    //~~~~~~~~~~~~~~Formating~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
          serviceCode.UsuallyPerformedByProviderTypeId === 2;
        var serviceCodePerformedByDentist =
          serviceCode.UsuallyPerformedByProviderTypeId === 1;

        if (hasAppointmentType) {
          var isHygieneAppointment =
            appointmentType.PerformedByProviderTypeId === 2;
          var isRegularAppointment =
            appointmentType.PerformedByProviderTypeId === 1;

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
      } else if (serviceCode != null && appointment == null && $scope.patient) {
        //For encounter services
        if (
          serviceCode.UsuallyPerformedByProviderTypeId === 1 &&
          $scope.patient.PreferredDentist
        ) {
          //If service is usually performed by dentist and the preferred dentist for a patient exists, set the provider user id for the service to preferred dentist
          return $scope.patient.PreferredDentist;
        } else if (
          serviceCode.UsuallyPerformedByProviderTypeId === 2 &&
          $scope.patient.PreferredHygienist
        ) {
          //If service is usually performed by hygienist and the preferred hygienist for a patient exists, set the provider user id for the service to preferred dentist
          return $scope.patient.PreferredHygienist;
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
          var AccountMemberId = appointment.Patient.PersonAccount
            ? appointment.Patient.PersonAccount.PersonAccountMember
                .AccountMemberId
            : null;
        if (AccountMemberId) return AccountMemberId;
        else return appointment.PersonId;
      } else if (serviceCode != null) {
        return serviceCode.AccountMemberId;
      } else {
        return null;
      }
    };
    $scope.createServiceTransaction = function (
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
          $scope.$parent.appointmentDate == null ||
          $scope.$parent.appointmentDate >= ctrl.dateToday
            ? ctrl.dateToday
            : $scope.$parent.appointmentDate,
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
        ObjectState: saveStates.Add,
        Selected: true,
        TransactionType: serviceCode ? serviceCode.TransactionType : '',
        UsuallyPerformedByProviderTypeId: serviceCode
          ? serviceCode.UsuallyPerformedByProviderTypeId
          : '',
        IsActive: serviceCode.IsActive,
        InactivationDate: serviceCode.InactivationDate,
      };
      serviceTransaction.CompleteDescription = serviceCode.Description;
      if (
        serviceCode.CdtCodeName !== null &&
        serviceCode.CdtCodeName !== '' &&
        serviceCode.CdtCodeName !== undefined
      )
        serviceTransaction.CompleteDescription =
          serviceCode.Description + ' (' + serviceCode.CdtCodeName + ')';
      serviceTransaction.InsuranceEstimates =
        financialService.CreateInsuranceEstimateObject(serviceTransaction);

      ctrl.setProposedAtLocationIdOnNewlyAddedService(serviceTransaction);

      return serviceTransaction;
    };

    // if this is a new service, then set the ProposedAtLocationId field to the LocationId of the user's globally selected location
    ctrl.setProposedAtLocationIdOnNewlyAddedService = function (
      serviceTransaction
    ) {
      if (serviceTransaction.ObjectState === saveStates.Add) {
        let globallySelectedLocation = JSON.parse(
          sessionStorage.getItem('userLocation')
        );
        if (globallySelectedLocation) {
          // set the ProposedAtLocationId property
          serviceTransaction.ProposedAtLocationId =
            globallySelectedLocation.LocationId
              ? globallySelectedLocation.LocationId
              : globallySelectedLocation.id;
        } else {
          // we should never be here, but we need to set a ProposedAtLocationId
          //  if code hits this point, it means the globally selected location didn't set the sessionStorage variable properly
          //  when it was loaded/changed
          serviceTransaction.ProposedAtLocationId =
            serviceTransaction.LocationId;
        }
      }

      return serviceTransaction;
    };

    $scope.formatServiceTransaction = function (serviceCode) {
      if (serviceCode) {
        if ($scope.patient && $scope.appointment && $scope.appointment.Data)
          $scope.appointment.Data.Patient = $scope.patient;
        if ($scope.appointment && $scope.appointment.Data) {
          return $scope.createServiceTransaction(
            serviceCode,
            $scope.appointment.Data,
            $scope.appointment.Data.appointmentType
          );
        } else if ($scope.appointment) {
          return $scope.createServiceTransaction(
            serviceCode,
            $scope.appointment,
            $scope.appointment.appointmentType
          );
        } else return $scope.createServiceTransaction(serviceCode, null, null);
      }
    };

    function getServiceCodeById(serviceCodeId) {
      var serviceCodes = referenceDataService.get(
        referenceDataService.entityNames.serviceCodes
      );
      return _.cloneDeep(
        _.find(serviceCodes, { ServiceCodeId: serviceCodeId })
      );
    }
    //~~~~~~~~~~~~~~Checking out/Adding services~~~~~~~~~~~~~~~~~
    $scope.selectedService = function (serviceCode, index) {
      var fullServiceCodeObj = getServiceCodeById(serviceCode.ServiceCodeId);
      if (serviceCode.$$isSelected) {
        $scope.selectedServiceCodes.push(fullServiceCodeObj);
      } else {
        $scope.selectedServiceCodes.splice(
          $scope.selectedServiceCodes.indexOf(fullServiceCodeObj),
          1
        );
      }
      $scope.disableQuickAdd = !_.isEmpty($scope.selectedServiceCodes);
    };
    $scope.quickAddService = function (serviceCode) {
      var fullServiceCodeObj = getServiceCodeById(serviceCode.ServiceCodeId);
      $scope.selectedServiceCodes.push(fullServiceCodeObj);
      $scope.onSelectedCodes();
    };

    ctrl.formattedServiceTransactions = function () {
      var ourList = _.cloneDeep($scope.selectedServiceCodes);
      var updated = [];
      //check for swift pick codes
      var serviceCodes = referenceDataService.get(
        referenceDataService.entityNames.serviceCodes
      );
      _.forEach(ourList, function (service) {
        if (service.IsSwiftPickCode === true) {
          _.forEach(service.SwiftPickServiceCodes, function (sc) {
            var fullServiceCodeObject = _.cloneDeep(
              listHelper.findItemByFieldValue(
                serviceCodes,
                'ServiceCodeId',
                sc.ServiceCodeId
              )
            );
            updated.push(fullServiceCodeObject);
          });
        } else {
          updated.push(service);
        }
      });
      ourList = [];
      var appType = null;
      var appt = null;
      if (
        $scope.appointment &&
        $scope.appointment.Data &&
        $scope.appointment.Data.appointmentType
      ) {
        appType = $scope.appointment.Data.appointmentType;
        appt = $scope.appointment.Data;
      } else if ($scope.appointment && $scope.appointment.appointmentType) {
        appType = $scope.appointment.Data.appointmentType;
        appt = $scope.appointment;
      }
      //format the service codes into service transactions
      _.forEach(updated, function (service) {
        ourList.push($scope.formatServiceTransaction(service, appt, appType));
      });
      return ourList;
    };
    $scope.onSelectedCodes = function () {
      if (
        patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthAddSvcKey
        ) &&
        !_.isEmpty($scope.selectedServiceCodes)
      ) {
        if ($scope.serviceFilter === 'appointment' && $scope.flyout) {
          //check for appointment page
          var returnedData = {
            PlannedServices: ctrl.formattedServiceTransactions(), //we have to turn our service codes into service transactions
            ServiceCodes: _.cloneDeep($scope.selectedServiceCodes), //we use the raw service code list, we dont have to format to give service codes
          };
        } else {
          //check for running appointment and encounter
          var returnedData = ctrl.formattedServiceTransactions(); //we have to turn our service codes into service transactions
        }
        if ($scope.flyout) {
          $scope.hideFilters();
        } else {
          $scope.clearCheckedRows();
          $scope.selectedServiceCodes = [];
        }
        //passing true to use the new modal
        $scope.addSelectedServices(returnedData, true);
      }
    };
    //~~~~~~~~~~~~~~Other~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    $scope.clearCheckedRows = function () {
      angular.forEach(
        $scope.filteredServiceCodes,
        function (filteredServiceCode) {
          filteredServiceCode.$$isSelected = false;
        }
      );
      $scope.disableQuickAdd = false;
    };
    $scope.showFilters = function () {
      $scope.clearCheckedRows();
      $scope.selectedServiceCodes = [];
      if ($scope.flyout) {
        angular.element('.' + $scope.containerClass).addClass('open');
      } else {
        angular.element('.newServiceSelectorRunning').addClass('open');
      }
    };
    $scope.hideFilters = function () {
      $scope.clearCheckedRows();
      $scope.selectedServiceCodes = [];
      if ($scope.flyout) {
        angular.element('.' + $scope.containerClass).removeClass('open');
      } else {
        angular.element('.newServiceSelectorRunning').removeClass('open');
      }
    };

    $scope.setStatus = function () {
      $scope.allowInactive = !$scope.allowInactive;
      $scope.filterServiceCodes();
    };
  }

  ServiceSelectorRefactorController.prototype = Object.create(BaseCtrl);
})();
