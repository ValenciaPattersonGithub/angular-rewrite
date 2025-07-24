'use strict';

angular.module('common.controllers').controller('ProposedSelectorController', [
  '$scope',
  '$rootScope',
  'localize',
  '$timeout',
  '$filter',
  'ListHelper',
  'toastrFactory',
  'referenceDataService',
  'PatientValidationFactory',
  'locationService',
  '$q',
  'TimeZones',
  'PatientAppointmentsFactory',
  'PersonFactory',
  'ModalFactory',
  'TreatmentPlansFactory',
  'ScheduleAppointmentHttpService',
  'ScheduleDisplayPlannedServicesService',
  'PracticesApiService',
  'ServiceCodesService',
  'ServiceTypesService',
  'FeatureFlagService',
  'FuseFlag',
  function (
    $scope,
    $rootScope,
    localize,
    $timeout,
    $filter,
    listHelper,
    toastrFactory,
    referenceDataService,
    patientValidationFactory,
    locationService,
    $q,
    timeZones,
    patientAppointmentsFactory,
    personFactory,
    modalFactory,
    treatmentPlansFactory,
    scheduleAppointmentHttpService,
    scheduleDisplayPlannedServicesService,
    practicesApiService,
    serviceCodesService,
    serviceTypesService,
    featureFlagService,
    fuseFlag,
  ) {
    var ctrl = this;
    ctrl.providerList = [];
    ctrl.proposedServices = [];
    ctrl.selectedServiceCodes = [];
    ctrl.userLocations = [];
    // disableQuickAdd - if one or more checkboxes are checked disable quick add links and enable the AddServices button
    $scope.disableQuickAdd = false;
    ctrl.firstLoad = true;
    ctrl.timeZones = _.cloneDeep(timeZones);
    ctrl.check = 0;
    ctrl.currentLocation = locationService.getCurrentLocation();
    ctrl.patientInfo = patientValidationFactory.GetPatientData();
    ctrl.loadingCheck = {};
    $scope.serviceTypes = [];
    $scope.hasProposedServices = true;
    $scope.filteringServices = false;
    $scope.loadingServiceTypes = true;
    $scope.filteringMessageNoResults = localize.getLocalizedString(
      'There are no {0} that match the filter.',
      ['service codes']
    );
    $scope.loadingMessageNoResults = localize.getLocalizedString(
      'There are no {0}.',
      ['service codes']
    );
    $scope.filterServiceList = '';
    $scope.orderBy = {
      field: 'Tooth',
      asc: true,
    };
    $scope.patientLocationMatch = false;

    $scope.serviceCodesFilters = {
      searchServiceCodesKeyword: '',
      allowInactive: false,
    };

    function onReferenceDataServiceLocationChanged() {
      ctrl.serviceCodes = referenceDataService.get(
        referenceDataService.entityNames.serviceCodes
      );
    }

    ctrl.referenceDataServiceLocationChangedReference = referenceDataService.registerForLocationSpecificDataChanged(
      onReferenceDataServiceLocationChanged
    );

    //~~~~~~~~~~~~~~Loading Data~~~~~~~~~~~~~~
    //Get Page Data when on running appointment
    ctrl.$onInit = function () {
      if (!$scope.flyout && $scope.serviceFilter == 'appointment') {
        ctrl.serviceCodes = referenceDataService.get(
          referenceDataService.entityNames.serviceCodes
        );
        ctrl.providerList = referenceDataService.get(
          referenceDataService.entityNames.users
        );

        ctrl.initializeServiceTypes().then(function () {
          // ensure proposed services loads after dependant services
          treatmentPlansFactory
            .ProposedServicesForAdd($scope.patient.PatientId)
            .then(function (res) {
              if (res && !_.isEmpty(res.Value)) {
                ctrl.proposedServicesResponse = res;
              }
            });
        });
      }
      switch ($scope.serviceFilter) {
        case 'appointment':
          $scope.containerClass = 'proposedSelectorAppointment';
          $scope.displayMessage = 'Appointment';
          break;
        case 'encounter-refactored':
        case 'encounter':
          $scope.containerClass = 'proposedSelectorEncounter';
          $scope.displayMessage = 'Encounter';
          break;
        case 'txplan':
          $scope.containerClass = 'proposedSelectorEncounter';
          $scope.displayMessage = 'Treatment Plan';
          break;
      }
    };

    ctrl.loadData = function (sender) {
      //debugger;
      // if broadcast sender matches service filter, or no sender specified, load data
      if ((sender && sender === $scope.serviceFilter) || !sender) {
        if (ctrl.firstLoad) {
          ctrl.firstLoad = false;
          ctrl.loadingCheck.loading = true;
          ctrl.loadingCheck.displayResults = true;

          ctrl.serviceCodes = referenceDataService.get(
            referenceDataService.entityNames.serviceCodes
          );
          ctrl.providerList = referenceDataService.get(
            referenceDataService.entityNames.users
          );
          //Get Proposed Services
          ctrl.getProposedServices();
        } else {
          ctrl.showFilters();
          $timeout(function () {
            if (
              angular.element(
                '.proposedSelectorAppointment input#searchBoxServiceCodes'
              ).length == 1
            ) {
              angular
                .element(
                  '.proposedSelectorAppointment input#searchBoxServiceCodes'
                )
                .focus();
            }
            if (
              angular.element(
                '.proposedSelectorEncounter input#searchBoxServiceCodes'
              ).length == 1
            ) {
              angular
                .element(
                  '.proposedSelectorEncounter input#searchBoxServiceCodes'
                )
                .focus();
            }
          }, 0);
          // some of the services may have changes, so check the status again
          if (
            $scope.serviceFilter == 'txplan' ||
            $scope.serviceFilter == 'appointment'
          ) {
            // mark services already on plan
            ctrl.processServicesForPlan(ctrl.serviceVms);
          }
          // disable services that can't be selected based on servicefilter
          ctrl.markServicesStatus(ctrl.serviceVms);
        }
      }
    };

    //this loads data when we click the button.
    $scope.$on('openProposedSelectorFlyout', function (event, sender) {
      ctrl.loadData(sender);
    });

    $scope.$on('closeFlyouts', function () {
      ctrl.loadingCheck.displayResults = false;

      $scope.hideFilters();
    });

    ctrl.loaded = function () {
      if (ctrl.loadingCheck && ctrl.loadingCheck.loading) {
        ctrl.loadingCheck.loading = false;
        if (ctrl.loadingCheck.displayResults) ctrl.showFilters();
      }
    };

    //get proposed services for user
    ctrl.proposedServicesResponse = null;

    ctrl.servicesToUpdate = [];
    ctrl.appointmentServiceInfo = [];
    $scope.usableData = [];

    function getServiceCodeById(serviceCodeId) {
      return _.cloneDeep(
        _.find(ctrl.serviceCodes, { ServiceCodeId: serviceCodeId })
      );
    }
    ctrl.getServiceCodeById = getServiceCodeById;

    // add service code info to proposed service
    ctrl.addServiceCodeInfo = function (ps) {
      var found = getServiceCodeById(ps.ServiceCodeId);
      if (found) {
        ps.CdtCode = found.CdtCodeName;
        ps.ServiceCodeString = found.Code;
        ps.Desc = found.Description;
        ps.showDisc = ps.Desc;
        ps.ServiceTypeDescription = found.ServiceTypeDescription;
        ps.IsSwiftPickCode = found.IsSwiftPickCode;
        ps.SwiftPickServiceCodes = found.SwiftPickServiceCodes;
        ps.serviceIsActive = found.IsActive;
        ps.serviceInactivationDate = found.InactivationDate
          ? new Date(
              found.InactivationDate +
                (found.InactivationDate.toLowerCase().endsWith('z') ? '' : 'Z')
            )
          : null;
      } else {
        ps.ServiceCodeString = ps.Description.slice(0, 5);
        var de = ps.Description.slice(6);
        ps.Desc = de.substring(0, de.indexOf('('));
        ps.showDisc = ps.Desc;
      }
    };

    ctrl.appointmentIds = [];

    ctrl.mapServiceTransactionToVm = function (serviceTransaction) {
      var vmTooth = serviceTransaction.Tooth;
      if (vmTooth === '' || vmTooth) {
        vmTooth = vmTooth === '' ? '0' : vmTooth;
        vmTooth = !isNaN(vmTooth) ? parseInt(vmTooth) : vmTooth;
      }
      return {
        ServiceTransactionId: serviceTransaction.ServiceTransactionId,
        $$locationService: serviceTransaction.$$locationService,
        AppointmentId: serviceTransaction.AppointmentId,
        $$onPlan: serviceTransaction.$$onPlan,
        $$wrongLocation: serviceTransaction.$$wrongLocation,
        $$invalidLocation: serviceTransaction.$$invalidLocation,
        serviceTitle: serviceTransaction.serviceTitle,
        LocationId: serviceTransaction.LocationId,
        serviceIsActive: serviceTransaction.serviceIsActive,
        serviceInactivationDate: serviceTransaction.serviceInactivationDate,
        ServiceCodeString: serviceTransaction.ServiceCodeString,
        ServiceCodeId: serviceTransaction.ServiceCodeId,
        CdtCode: serviceTransaction.CdtCode,
        Desc: serviceTransaction.Desc,
        Tooth: vmTooth,
        Area: serviceTransaction.Area,
        Name: serviceTransaction.Name,
        Fee: serviceTransaction.Fee,
        InsuranceEstimates: serviceTransaction.InsuranceEstimates,
        IsActive: serviceTransaction.IsActive,
        $$hasBeenAddedToATxPlan: false,
        $$hasBeenAddedToThisTxPlan: false,
        ServiceTypeDescription: serviceTransaction.ServiceTypeDescription,
        $$isSelected: false,
      };
    };

    $scope.$watch(
      'serviceCodesFilters.searchServiceCodesKeyword',
      function (nv, ov) {
        if (!_.isEqual(nv, ov)) {
          $scope.filteredProposedServices = ctrl.filterProposedServices(
            ctrl.serviceVms
          );
          if (!_.isEmpty(nv)) {
            $scope.filteringServices = true;
          }
        }
      }
    );

    ctrl.filterProposedServices = function (services) {
      var filteredProposedServices = _.filter(
        services,
        function (proposedServices) {
          var activeCheck =
            $scope.serviceCodesFilters.allowInactive ||
            proposedServices.IsActive;
          var serviceTypeCheck =
            $scope.filterServiceList === '' ||
            proposedServices.ServiceTypeDescription ===
              $scope.filterServiceList;
          var searchCheck = true;
          if (
            !_.isEmpty($scope.serviceCodesFilters.searchServiceCodesKeyword)
          ) {
            var searchStrLowerCase = _.toLower(
              $scope.serviceCodesFilters.searchServiceCodesKeyword
            );
            if (
              !_.includes(
                _.toLower(proposedServices.ServiceCodeString),
                searchStrLowerCase
              ) &&
              !_.includes(
                _.toLower(proposedServices.CdtCode),
                searchStrLowerCase
              ) &&
              !_.includes(
                _.toLower(proposedServices.Desc),
                searchStrLowerCase
              ) &&
              !_.includes(
                _.toLower(proposedServices.Tooth),
                searchStrLowerCase
              ) &&
              !_.includes(
                _.toLower(proposedServices.Area),
                searchStrLowerCase
              ) &&
              !_.includes(
                _.toLower(proposedServices.Name),
                searchStrLowerCase
              ) &&
              !_.includes(
                _.toLower(proposedServices.Fee),
                searchStrLowerCase
              ) &&
              !_.includes(
                _.toLower(proposedServices.InsuranceEstimates),
                searchStrLowerCase
              )
            ) {
              searchCheck = false;
            }
          }
          return serviceTypeCheck && activeCheck && searchCheck;
        }
      );

      // Sort
      if (!_.isEmpty($scope.orderBy.field)) {
        filteredProposedServices = _.orderBy(
          filteredProposedServices,
          $scope.orderBy.field,
          $scope.orderBy.asc ? 'asc' : 'desc'
        );
        $scope.orderBy.asc = false;
      }

      return filteredProposedServices;
    };

    $scope.getAllProposedServicesSuccess = function (res) {
      if (res) {
        ctrl.servicesToUpdate = [];
        ctrl.appointmentServiceInfo = [];
        $scope.usableData = [];
        // filter out service transactions that are not proposes services before processing
        ctrl.proposedServices = res;
        // use as indicator that there are no proposed services
        $scope.hasProposedServices = _.isEmpty(ctrl.proposedServices)
          ? false
          : ctrl.proposedServices.length > 0;
        practicesApiService.getLocationsWithDetails(1120).then(function (res) {
          ctrl.locations = res.data;
          if (ctrl.locations !== null && ctrl.locations.length > 0) {
            ctrl.userLocations = ctrl.locations;
          }
          _.forEach(ctrl.proposedServices, function (ps) {
            ps.$$invalidLocation = ctrl.isUserLocationValid(ps);
            ps.serviceTitle = ps.$$invalidLocation
              ? ''
              : 'You are not authorized to access this area.';
            var provider = listHelper.findItemByFieldValue(
              ctrl.providerList,
              'UserId',
              ps.ProviderUserId
            );
            if (provider) {
              ps.UserCode = provider.UserCode;
              ps.Name = provider.FirstName + ' ' + provider.LastName;
            }
            ctrl.addServiceCodeInfo(ps);
            ps.Area =
              ps.Roots != null
                ? ps.Roots
                : scheduleDisplayPlannedServicesService.getSurfacesInSummaryFormat(
                    ps.Surface
                  );
            if (ps.Area == null) {
              ps.Area = '';
            }
            if (ps.Tooth == null) {
              ps.Tooth = '';
            }
          });
          if (!_.isEmpty(ctrl.appointmentServiceInfo)) {
            $q.all(ctrl.appointmentServiceInfo).then(
              ctrl.updateServicesWithAppInfo
            );
          }

          // Attach Service Code active status to ctrl.proposedServices
          _.forEach(ctrl.proposedServices, function (service) {
            var serviceCode = getServiceCodeById(service.ServiceCodeId);
            service.IsActive = serviceCode.IsActive;
            service.InactivationDate = serviceCode.InactivationDate;
          });
          ctrl.filterByLocation();

          $scope.compareServLocations();

          ctrl.serviceVms = _.map(
            ctrl.proposedServices,
            ctrl.mapServiceTransactionToVm
          );
          if (
            $scope.serviceFilter == 'txplan' ||
            $scope.serviceFilter == 'appointment'
          ) {
            // mark services already on plan
            ctrl.processServicesForPlan(ctrl.serviceVms);
          }
          // disable services that can't be selected based on servicefilter
          ctrl.markServicesStatus(ctrl.serviceVms);
          $scope.filteredProposedServices = ctrl.filterProposedServices(
            ctrl.serviceVms
          );

          if ($scope.serviceFilter == 'txplan') {
            ctrl.setHasBeenAddedToOtherTreatmentPlans();
          }

          ctrl.loaded();
        });
      }
    };
    ctrl.updateServicesWithAppInfo = function (results) {
      _.forEach(results, function (serv) {
        if (serv.Value) {
          $scope.usableData[serv.Value.Appointment.AppointmentId] = {
            time: serv.Value.Appointment.StartTime,
            locationname: serv.Value.Location.NameLine1,
            timezone: ctrl.setDisplayTimezone(serv.Value.Location.Timezone),
          };
        }
      });
      ctrl.updatePropServices();
    };
    ctrl.updatePropServices = function () {
      _.forEach(ctrl.servicesToUpdate, function (serv) {
        if (serv.AppointmentId) {
          var found = $scope.usableData[serv.AppointmentId];
          if (found) {
            serv.AppointmentInfo = _.cloneDeep(found);
          } else {
            serv.AppointmentInfo = null;
          }
        } else {
          serv.AppointmentInfo = null;
        }
      });

      $scope.hasProposedServices = _.isEmpty(ctrl.proposedServices)
        ? false
        : ctrl.proposedServices.length > 0;
    };

    ctrl.processServicesForPlan = function (services) {
      if (!$scope.servicesOnPlan) return;

      _.forEach(services, function (service) {
        if ($scope.servicesOnPlan.indexOf(service.ServiceTransactionId) >= 0) {
          service.$$onPlan = true;
          //disable Services that are on appointment or services added to an encounter/appointment/tx plans
          service.$$disableAddService = true;
        }
      });
    };

    // enable / disable services for selection
    // NOTE rules are different depending on whether this module is accessed by encounter, appointment, or treatment plans
    ctrl.markServicesStatus = function (services) {
      switch ($scope.serviceFilter) {
        case 'encounter-refactored':
          // all services on an encounter must be from the current location and match all other services on the encounter
          // so disable services that have a different locationId based on first serviceTransaction on plan
          // proposed service location must match the current location and not be on the current encounter
          // Reference
          _.forEach(services, function (service) {
            service.$$disableAddService = false;
            // proposed service can't be added to the same list twice
            if (
              $scope.servicesOnPlan &&
              $scope.servicesOnPlan.indexOf(service.ServiceTransactionId) >= 0
            ) {
              service.$$disableAddService = true;
            }
            if (service.LocationId !== ctrl.currentLocation.id) {
              service.$$disableAddService = true;
            }
          });
          break;
        case 'txplan':
          // get the first service on the plan based on $scope.servicesOnPlan
          // All services on a treatment plan must be the same location, based on the first service added,
          // so disable services that have a different locationId based on first serviceTransaction on plan
          var treatmentPlanLocationId = ctrl.currentLocation.id;
          var serviceTransaction = _.find(ctrl.serviceVms, {
            ServiceTransactionId: $scope.servicesOnPlan[0],
          });
          if (!_.isNil(serviceTransaction)) {
            treatmentPlanLocationId = serviceTransaction.LocationId;
          }
          _.forEach(services, function (service) {
            service.$$disableAddService = false;
            // proposed service can't be added to the same list twice
            if (
              $scope.servicesOnPlan &&
              $scope.servicesOnPlan.indexOf(service.ServiceTransactionId) >= 0
            ) {
              service.$$disableAddService = true;
            }
          });
          break;
        default:
          // appointments
          _.forEach(services, function (service) {
            service.$$disableAddService = false;
            // proposed service can't be added to an appointment if its already on another appointment
            if (service.AppointmentId) {
              service.$$disableAddService = true;
            }
            // proposed service can't be added to the same list twice
            if (
              $scope.servicesOnPlan &&
              $scope.servicesOnPlan.indexOf(service.ServiceTransactionId) >= 0
            ) {
              service.$$disableAddService = true;
            }
          });
          break;
      }
    };

    ctrl.filterByLocation = function () {
      if (ctrl.currentLocation) {
        $scope.checkPatientLocation();
        _.forEach(ctrl.proposedServices, function (service) {
          service.$$locationService = false;
          if (service.LocationId == ctrl.currentLocation.id) {
            service.$$locationService = true;
          }
        });
        var filtered = $filter('orderBy')(
          ctrl.proposedServices,
          '$$locationService',
          true
        );
        ctrl.proposedServices = filtered;
      }
    };

    //get service types
    ctrl.initializeServiceTypes = function () {
      return new Promise((resolve) => {
        serviceTypesService.getAll()
          .then(function (serviceTypes) {
            $scope.serviceTypes = serviceTypes;
            $scope.loadingServiceTypes = false;
            resolve();
          });
      });
    };

    ctrl.setDisplayTimezone = function (zone) {
      if (zone) {
        return listHelper.findItemByFieldValue(ctrl.timeZones, 'Value', zone)
          .Abbr;
      } else {
        return '';
      }
    };
    //changes the sorting on the grid based on field
    $scope.changeSortingForGrid = function (field) {
      var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : false;
      $scope.orderBy = { field: field, asc: asc };
    };

    //sets up the ng-model for the filter drop down
    $scope.changeFilter = function (model) {
      $scope.filterServiceList = model;
      $scope.filteredProposedServices = ctrl.filterProposedServices(
        ctrl.serviceVms
      );
    };
    $scope.$watch('chosenLocation.LocationId', function (nv, ov) {
      if (nv != ov) {
        $scope.compareServLocations();
      }
    });
    $scope.compareServLocations = function () {
      _.forEach(ctrl.proposedServices, function (serv) {
        serv.$$wrongLocation =
          $scope.chosenLocation != null &&
          serv.LocationId != $scope.chosenLocation.LocationId;
      });
    };
    //turns the quick add buttons on and off depending on if a service is selected
    $scope.quickAddStatus = function (service) {
      return (
        $scope.disableQuickAdd ||
        (service && (service.$$onPlan || service.$$wrongLocation))
      );
    };

    //~~~~~~~~~~~~~~Checking out / Adding Services~~~~~~~~~~~~~~
    //trigger which service codes have been checked to be added
    $scope.selectedService = function (serviceCode, index) {
      if (serviceCode.$$isSelected) {
        ctrl.selectedServiceCodes.push(serviceCode);
      } else {
        ctrl.selectedServiceCodes.splice(
          ctrl.selectedServiceCodes.indexOf(serviceCode),
          1
        );
      }
      if (!_.isEmpty(ctrl.selectedServiceCodes)) {
        $scope.disableQuickAdd = true;
      } else {
        $scope.disableQuickAdd = false;
      }
    };

    // helper for opening warning modal
    ctrl.openServiceCodesNeedUpdatedModal = function (
      serviceCodesThatNeedUpdated
    ) {
      var message = localize.getLocalizedString(
        'The affected area of Service(s) {0} are missing and must be completed before proceeding.',
        [serviceCodesThatNeedUpdated.join(', ')]
      );
      var title = localize.getLocalizedString('Changes Needed');
      var button1Text = localize.getLocalizedString('OK');
      modalFactory.ConfirmModal(title, message, button1Text);
    };

    //add service when they hit quick add
    $scope.quickAddService = function (proposedServiceVm) {
      // reference BUG 360414
      // NOTE this check requires the Root, Surface, and other info that the Vm doesn't contain so we will need to look up the original
      // before this check is done
      var selectedService = _.find(ctrl.proposedServices, {
        ServiceTransactionId: proposedServiceVm.ServiceTransactionId,
      });
      if (!_.isEmpty(selectedService)) {
        selectedService.Code = proposedServiceVm.ServiceCodeString;
        // query for any services that might need to be updated before selected
        var serviceCodesThatNeedUpdated = serviceCodesService.CheckForAffectedAreaChanges(
          [selectedService],
          ctrl.serviceCodes,
          false
        );
        if (!_.isEmpty(serviceCodesThatNeedUpdated)) {
          ctrl.openServiceCodesNeedUpdatedModal(serviceCodesThatNeedUpdated);
        } else {
          ctrl.selectedServiceCodes.push(selectedService);
          $scope.onSelectedCodes();
        }
      }
    };

    //push the current list of proposed services to the page
    $scope.onSelectedCodes = function () {
      var securityCheck = true;
      var serviceCodesToAdd = _.cloneDeep(ctrl.selectedServiceCodes);
      ctrl.selectedServiceCodes = [];

      _.forEach(serviceCodesToAdd, function (sc) {
        var serviceCode = _.find(ctrl.proposedServicesResponse, {
          ServiceTransactionId: sc.ServiceTransactionId,
        });
        serviceCode.Code = serviceCode.ServiceCodeString;
        ctrl.selectedServiceCodes.push(serviceCode);
      });
      var serviceCodesThatNeedUpdated = serviceCodesService.CheckForAffectedAreaChanges(
        ctrl.selectedServiceCodes,
        ctrl.serviceCodes,
        false
      );
      if (!_.isEmpty(serviceCodesThatNeedUpdated)) {
        ctrl.openServiceCodesNeedUpdatedModal(serviceCodesThatNeedUpdated);
      } else if (securityCheck) {
        //patSecurityService.IsAuthorizedByAbbreviation($scope.soarAuthEnctrAddSvcKey)
        ctrl.updateCheckedRowsProposedServices();
        var returnedData = null;
        if ($scope.serviceFilter == 'appointment' && $scope.flyout) {
          //check for appointment page
          returnedData = {
            PlannedServices: _.cloneDeep(ctrl.selectedServiceCodes),
            ServiceCodes: ctrl.getSelectedServiceCodesProposed(),
          };
        } else if ($scope.serviceFilter == 'encounter-refactored') {
          var servicesToRemoveFromAppointment = [];
          var currentTime = new Date(Date.now()).toISOString();
          //loop through selected service codes
          _.forEach(ctrl.selectedServiceCodes, function (serviceCode) {
            //check for future appointment on service
            if (
              serviceCode.AppointmentId !== null &&
              serviceCode.StartTime > currentTime
            ) {
              servicesToRemoveFromAppointment.push(
                serviceCode.ServiceTransactionId
              );
            }
          });
          if (servicesToRemoveFromAppointment.length > 0) {
            //modal removing service(s) from appointment
            ctrl.promptServiceOnFutureAppointment(
              servicesToRemoveFromAppointment
            );
            return;
          }
        }
        ctrl.addServicesToEncounter(returnedData);
      }
    };

    ctrl.addServicesToEncounter = function (returnedData) {
      var services = returnedData
        ? returnedData
        : _.cloneDeep(ctrl.selectedServiceCodes);
      if ($scope.flyout) {
        $scope.hideFilters();
      } else {
        $scope.clearCheckedRows();
        ctrl.selectedServiceCodes = [];
      }
      //passing false to not use the new modal
      $scope.addSelectedServices(services, false);
    };

    ctrl.promptServiceOnFutureAppointment = function (
      servicesToRemoveFromAppointment
    ) {
      var title, message, continueButtonText, cancelButtonText;
      if (ctrl.selectedServiceCodes.length > 1) {
        title = localize.getLocalizedString(
          'One or more of these proposed services are on a future appointment.'
        );
        message = localize.getLocalizedString(
          'Adding these service(s) to the encounter will remove them from the appointment. Would you like to continue?'
        );
      } else {
        title = localize.getLocalizedString(
          'This proposed service is on a future appointment.'
        );
        message = localize.getLocalizedString(
          'Adding this service to the encounter will remove it from the appointment. Would you like to continue?'
        );
      }
      continueButtonText = localize.getLocalizedString('Confirm');
      cancelButtonText = localize.getLocalizedString('Cancel');
      modalFactory
        .ConfirmModal(title, message, continueButtonText, cancelButtonText)
        .then(
          function () {
            for (let i = 0; i < ctrl.selectedServiceCodes.length; i++) {
              if (
                servicesToRemoveFromAppointment.includes(
                  ctrl.selectedServiceCodes[i].ServiceTransactionId
                )
              ) {
                ctrl.selectedServiceCodes[i].AppointmentId = null;
              }
            }
            ctrl.addServicesToEncounter();
          },
          function () {
            ctrl.selectedServiceCodes = [];
            ctrl.addServicesToEncounter();
          }
        );
    };

    ctrl.getProposedServices = function () {
      scheduleAppointmentHttpService
        .getProposedServicesWithAppointmentStartTimeWithPromise(
          $scope.patient.PatientId
        )
        .then(function (res) {
          if (res) {
            ctrl.proposedServicesResponse = res;
          }
          if (ctrl.proposedServicesResponse) {
            ctrl.initializeServiceTypes().then(function () {
              ctrl.loaded();
              // ensure proposed services loads after dependant services
              $scope.getAllProposedServicesSuccess(
                ctrl.proposedServicesResponse
              );
              $timeout(function () {
                if (
                  angular.element(
                    '.proposedSelectorAppointment input#searchBoxServiceCodes'
                  ).length == 1
                ) {
                  angular
                    .element(
                      '.proposedSelectorAppointment input#searchBoxServiceCodes'
                    )
                    .focus();
                }
                if (
                  angular.element(
                    '.proposedSelectorEncounter input#searchBoxServiceCodes'
                  ).length == 1
                ) {
                  angular
                    .element(
                      '.proposedSelectorEncounter input#searchBoxServiceCodes'
                    )
                    .focus();
                }
              }, 0);
            });
          } else {
            ctrl.showFilters();
            ctrl.loadingCheck.loading = false;
          }
        });
    };

    //adds required fields to the proposed services
    ctrl.updateCheckedRowsProposedServices = function () {
      ctrl.selectedServiceCodes;
      _.forEach(ctrl.selectedServiceCodes, function (service) {
        var serviceCode = listHelper.findItemByFieldValue(
          ctrl.serviceCodes,
          'ServiceCodeId',
          service.ServiceCodeId
        );
        service.$$isProposed = true;
        service.Code = serviceCode.Code;
        service.ServiceCode = serviceCode.Code;
        service.DisplayAs = serviceCode.DisplayAs;
        service.AffectedAreaId = serviceCode.AffectedAreaId;
        service.ObjectState = 'Update';
      });
    };
    //gets service codes based on which proposed services are selected. Used on appointment modal
    ctrl.getSelectedServiceCodesProposed = function () {
      var serviceCodeList = [];

      _.forEach(ctrl.selectedServiceCodes, function (service) {
        var serviceCode = _.find(ctrl.serviceCodes, {
          ServiceCodeId: service.ServiceCodeId,
        });

        if (!_.isEmpty(serviceCode)) {
          serviceCodeList.push(_.cloneDeep(serviceCode));
        }
      });

      return serviceCodeList;
    };
    //cleans the grid when we add/close
    $scope.clearCheckedRows = function () {
      _.forEach(
        $scope.filteredProposedServices,
        function (filteredServiceCode) {
          filteredServiceCode.$$isSelected = false;
        }
      );
      $scope.disableQuickAdd = false;
    };
    //show the flyout
    ctrl.showFilters = function () {
      $scope.clearCheckedRows();
      ctrl.selectedServiceCodes = [];
      if ($scope.flyout) {
        angular.element('.' + $scope.containerClass).addClass('open');
      } else {
        angular.element('.proposedSelectorRunning').addClass('open');
      }

      if (
        ($scope.serviceFilter == 'txplan' ||
          $scope.serviceFilter == 'appointment') &&
        !_.isEmpty(ctrl.serviceVms)
      ) {
        ctrl.processServicesForPlan(ctrl.serviceVms);
      }
      $scope.hasProposedServices = _.isEmpty(ctrl.proposedServices)
        ? false
        : ctrl.proposedServices.length > 0;
    };
    //hides the flyout
    $scope.hideFilters = function () {
      $scope.clearCheckedRows();
      ctrl.selectedServiceCodes = [];
      if ($scope.flyout) {
        angular.element('.' + $scope.containerClass).removeClass('open');
      } else {
        angular.element('.proposedSelectorRunning').removeClass('open');
      }
    };

    // Check to ensure the patient is active at the current location in the app header
    $scope.checkPatientLocation = function () {
      // sometimes patientInfo hasn't been loaded with new data, either by the parent or current controller
      // for now, we'll call to get the info if that happens
      // note, the best solution would be to ensure patientValidationFactory.CheckPatientLocation
      // has the data it needs but that's outside of the scope of a bug fix
      if (
        ctrl.patientInfo &&
        ctrl.patientInfo.PatientId &&
        ctrl.patientInfo.PatientId === $scope.patient.PatientId
      ) {
        $scope.patientLocationMatch = patientValidationFactory.CheckPatientLocation(
          ctrl.patientInfo,
          ctrl.currentLocation
        );
      } else {
        // set the patientData if none
        if ($scope.patient.PatientId) {
          personFactory.Overview($scope.patient.PatientId).then(function (res) {
            ctrl.patientInfo = res.Value;
            patientValidationFactory.SetPatientData(res.Value);
            $scope.patientLocationMatch = patientValidationFactory.CheckPatientLocation(
              ctrl.patientInfo,
              ctrl.currentLocation
            );
          });
        }
      }
    };

    $scope.setStatus = function () {
      $scope.filteredProposedServices = ctrl.filterProposedServices(
        ctrl.serviceVms
      );
    };

    //#region show services that are on existing plans

    // listening for changes to ExistingTreatmentPlans if the service filter is for tx plan
    $scope.$watch(
      function () {
        return treatmentPlansFactory.ExistingTreatmentPlans;
      },
      function (nv) {
        if ($scope.serviceFilter == 'txplan') {
          ctrl.existingTreatmentPlans = nv;
          ctrl.setHasBeenAddedToOtherTreatmentPlans();
        }
      },
      true
    );

    // used to determine whether or not to show the check mark
    ctrl.setHasBeenAddedToOtherTreatmentPlans = function () {
      if (ctrl.existingTreatmentPlans && ctrl.serviceVms) {
        var idsOnAllPlans = [];
        // build a list of services on all treatment plans
        _.forEach(ctrl.existingTreatmentPlans, function (etp) {
          idsOnAllPlans = _.uniq(
            _.concat(
              idsOnAllPlans,
              _.map(
                etp.TreatmentPlanServices,
                'ServiceTransaction.ServiceTransactionId'
              )
            )
          );
        });
        // list of services not on the this plan
        if (!_.isEmpty(idsOnAllPlans) || !_.isEmpty($scope.servicesOnPlan)) {
          _.forEach(ctrl.serviceVms, function (ps) {
            ps.$$hasBeenAddedToATxPlan =
              idsOnAllPlans.indexOf(ps.ServiceTransactionId) !== -1;
            // recheck this each time a treatment plan changes
            ps.$$onPlan =
              $scope.servicesOnPlan.indexOf(ps.ServiceTransactionId) !== -1;
          });
        }
      }
    };

    //#endregion

    //#region location

    ctrl.onLocationChange = function () {
      ctrl.currentLocation = locationService.getCurrentLocation();
      // check to see if these services are ok to add for this location
      ctrl.markServicesStatus(ctrl.serviceVms);
      // check patient locations for this location
      $scope.checkPatientLocation();
    };

    // this is hit when location changes in the UI
    $scope.$on('patCore:initlocation', function () {
      ctrl.onLocationChange();
    });

    $scope.$on('$destroy', function () {
      referenceDataService.unregisterForLocationSpecificDataChanged(
        ctrl.referenceDataServiceLocationChangedReference
      );
    });

    ctrl.checkForDuplicates = function (serviceTransactionId) {
      return _.some($scope.servicesAdded, function (service) {
        return service.ServiceTransactionId === serviceTransactionId;
      });
    };

    ctrl.disableDuplicateServices = function () {
      if (
        $scope.filteredProposedServices &&
        $scope.filteredProposedServices.length > 0
      ) {
        _.forEach($scope.filteredProposedServices, function (st) {
          st.$$disableAddService = ctrl.checkForDuplicates(
            st.ServiceTransactionId
          );
        });
      }
    };

    ctrl.isUserLocationValid = function (service) {
      for (let i = 0; i < ctrl.userLocations.length; i++) {
        if (service.LocationId === ctrl.userLocations[i].LocationId) {
          return true;
        }
      }
      return false;
    };
    //#endregion
  },
]);
