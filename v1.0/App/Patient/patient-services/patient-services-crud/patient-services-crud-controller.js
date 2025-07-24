'use strict';
// ARWEN: #509747 This looks like it is not being used.
angular.module('Soar.Patient').controller('PatientServicesCrudController', [
  '$scope',
  '$rootScope',
  '$q',
  '$routeParams',
  'toastrFactory',
  'localize',
  'teeth',
  'selectedServiceData',
  'personId',
  'patientInfo',
  'providers',
  'PatientServices',
  'serviceTransaction',
  '$uibModalInstance',
  '$uibModal',
  'ModalFactory',
  'ListHelper',
  '$filter',
  'StaticData',
  'patSecurityService',
  '$location',
  '$timeout',
  'SaveStates',
  'preSelectedTreatmentPlan',
  'FinancialService',
  'TreatmentPlansFactory',
  'locationService',
  'referenceDataService',
  function (
    $scope,
    $rootScope,
    $q,
    $routeParams,
    toastrFactory,
    localize,
    teeth,
    selectedServiceData,
    personId,
    patientInfo,
    providers,
    patientServices,
    serviceTransaction,
    $uibModalInstance,
    modal,
    modalFactory,
    listHelper,
    $filter,
    staticData,
    patSecurityService,
    $location,
    $timeout,
    saveStates,
    preSelectedTreatmentPlan,
    financialService,
    treatmentPlansFactory,
    locationService,
    referenceDataService
  ) {
    //#region initialization

    var ctrl = this;

    // everything that needs to happen on instantiation of the controller
    ctrl.init = function () {
      $scope.planStages = [];
      $scope.stageSelected = 1;

      // vars
      $scope.editMode = serviceTransaction ? true : false;
      $scope.amfa = $scope.editMode
        ? 'soar-clin-cpsvc-edit'
        : 'soar-clin-cpsvc-add';
      $scope.savingForm = false;
      $scope.canCloseModal = true;
      $scope.maxDate = moment(new Date());
      $scope.validDate = true;
      $scope.formIsValid = false;
      $scope.personId = personId;
      $scope.patientInfo = patientInfo;
      $scope.activeTooth = {};
      $scope.preSelectedTeeth = teeth;
      $scope.toothSelectionDisabled = true;
      $scope.surfaceSelectionDisabled = true;
      $scope.rootSelectionDisabled = true;
      $scope.quadrantSelectionOnly = false;
      $scope.searchIsQueryingServer = false;
      $scope.searchData = { searchTerm: '' };
      $scope.selectedService = null;
      $scope.preSelectedServiceData = selectedServiceData;
      $scope.disableStatus = function () {
        return preSelectedTreatmentPlan ? true : false;
      };

      // Flag to indicate, if auto-select or auto-focus operation needs to be performed. Contains a boolean property 'value' - if value is true auto-select item in typeahead when there is a single item, else auto-focus the typeahead control and display list of items
      $scope.selectAutoFocus = { value: false };

      //ctrl.preSelectedTreatmentPlanData = selectedTreatmentPlanId;
      // filtering out inactive providers
      $scope.providers = providers;
      //$scope.providers = $filter('filter')(providers, {
      //    IsActive: true
      //});
      // $scope.serviceButtons = $filter('orderBy')(serviceButtons, 'Description');
      //$scope.typeOrMaterialsActual = angular.copy($filter('orderBy')(typeOrMaterials, 'Description'));
      // $scope.typeOrMaterialsFiltered = angular.copy($scope.typeOrMaterialsActual);
      // functions to call on load
      ctrl.authAccess();
      ctrl.getTeethDefinitions();
      ctrl.validateForm();
      ctrl.getServiceTransactionStatuses();
      ctrl.getTreatmentPlanHeaders();

      // ctrl.lastTypeOrMaterial = "";
      $scope.servicesCount = $scope.iterationCount = 0;
      if (serviceTransaction === null) {
        $scope.serviceTransaction = ctrl.createServiceTransaction(null, true);
        var selectedService = null;
        $timeout(function () {
          if (
            $scope.preSelectedServiceData &&
            $scope.preSelectedServiceData.IsSwiftPickCode &&
            $scope.preSelectedServiceData.SwiftPickServiceCodes &&
            $scope.preSelectedServiceData.SwiftPickServiceCodes.length > 0
          ) {
            $scope.servicesCount =
              $scope.preSelectedServiceData.SwiftPickServiceCodes.length;
            $scope.iterationCount++;
            selectedService =
              $scope.preSelectedServiceData.SwiftPickServiceCodes[
                $scope.iterationCount - 1
              ];
          } else {
            selectedService = $scope.preSelectedServiceData;
          }
          ctrl.setPreSelectedServiceData(selectedService);
          $scope.originalServiceTransaction = angular.copy(
            $scope.serviceTransaction
          );
        }, 200);
      } else {
        // edit mode
        $scope.serviceTransaction = serviceTransaction;
        $scope.originalServiceTransaction = angular.copy(
          $scope.serviceTransaction
        );
        if ($scope.serviceTransaction.Tooth) {
          var selectedTooth = { toothId: $scope.serviceTransaction.Tooth };
          $scope.preSelectedTeeth = [selectedTooth];
          ctrl.getTeethDefinitions();
        }
        ctrl.setDisabledFlags($scope.serviceTransaction);
        ctrl.applyServiceTransactionRules(
          $scope.serviceTransaction.ServiceTransactionStatusId
        );
        ctrl.validateForm();

        $scope.selectAutoFocus.value = false;
      }

      $scope.bFocus = false;
      ctrl.addedServicesCount = 0;
    };

    // Set pre-selected data for service transaction
    ctrl.setPreSelectedServiceData = function (selectedService) {
      if (selectedService) {
        // If the modal is opened on click of service code, set service code properties
        if (selectedService.ServiceCodeId) {
          $scope.selectAutoFocus.value = false;

          // reset affected area selection flags
          $scope.toothSelectionDisabled = true;
          $scope.surfaceSelectionDisabled = true;
          $scope.rootSelectionDisabled = true;
          $scope.quadrantSelectionOnly = false;

          $scope.selectResult(selectedService).then(function () {
            // filter service buttons and type or materials data.
            var element = angular.element('#inpFee');
            if (element) {
              element.focus();
            }
          });
        } else {
          ctrl.validateForm();
          $scope.selectAutoFocus.value = true;
        }
      }
    };

    //#endregion

    // Navigation: User selects swift code from favorites tab or services tab in clinical chart screen
    // Skips current service code and load data for next service code from the collection of service codes in a currently selected swift code
    $scope.skipService = function () {
      ctrl.checkForChanges();
      if (!$scope.canCloseModal) {
        modalFactory.CancelModal().then(ctrl.doNextService);
      } else {
        ctrl.doNextService();
      }
    };

    // Navigation: User selects swift code from favorites tab or services tab in clinical chart screen
    // Loads the data for next service code from the collection of service codes in a currently selected swift code
    ctrl.doNextService = function () {
      if ($scope.servicesCount > 1) {
        if ($scope.iterationCount !== $scope.servicesCount) {
          $scope.iterationCount++;
          $scope.preSelectedTeeth = teeth;
          ctrl.getTeethDefinitions();
          $scope.serviceTransaction = ctrl.createServiceTransaction(null, true);
          ctrl.setPreSelectedServiceData(
            $scope.preSelectedServiceData.SwiftPickServiceCodes[
              $scope.iterationCount - 1
            ]
          );

          $scope.originalServiceTransaction = angular.copy(
            $scope.serviceTransaction
          );
        }
      }
    };

    //#region auth serviceTransactions / tx plan add services
    $scope.hasTreatmentPlanHeadersViewAccess = false;
    $scope.hasTreatmentPlanHeadersAddServicesAccess = false;

    ctrl.authServiceTransactionCreateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation($scope.amfa);
    };

    ctrl.authTreatmentPlanHeadersViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-cplan-view'
      );
    };

    ctrl.authTreatmentPlanHeadersAddServicesAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-cplan-asvccd'
      );
    };

    $scope.hasTreatmentPlanHeadersViewAccess = true;
    ctrl.authAccess = function () {
      if (ctrl.authServiceTransactionCreateAccess()) {
        $scope.hasServiceTransactionCreateAccess = true;
      }
      if (ctrl.authTreatmentPlanHeadersViewAccess()) {
        $scope.hasTreatmentPlanHeadersViewAccess = true;
      }
      if (ctrl.authTreatmentPlanHeadersAddServicesAccess()) {
        $scope.hasTreatmentPlanHeadersAddServicesAccess = true;
      }
    };

    //#endregion

    //#region selected teeth

    // populating selectedTeeth array
    ctrl.addSelectedTeeth = function (allTeeth) {
      $scope.selectedTeeth = [];
      angular.forEach($scope.preSelectedTeeth, function (tooth) {
        var item = listHelper.findItemByFieldValue(
          allTeeth,
          'USNumber',
          tooth.toothId
        );
        if (item) {
          if ($scope.serviceTransaction) {
            if ($scope.serviceTransaction.Surface) {
              var surfaces = $scope.serviceTransaction.Surface.split(',');
              item.SelectedSurfaces = [];
              angular.forEach(surfaces, function (sfc) {
                item.SelectedSurfaces.push({
                  Surface: sfc,
                });
              });
            }
            if ($scope.serviceTransaction.Roots) {
              var roots = $scope.serviceTransaction.Roots.split(',');
              item.SelectedRoots = [];
              angular.forEach(roots, function (root) {
                item.SelectedRoots.push({
                  Roots: root,
                });
              });
            }
          }
          $scope.selectedTeeth.push(item);
        } else {
          // when toothId is a quadrant abbrev
          var abbrevs = staticData.TeethQuadrantAbbreviations();
          var quadrantName;
          for (var prop in abbrevs) {
            if (
              abbrevs.hasOwnProperty(prop) &&
              abbrevs[prop] === tooth.toothId
            ) {
              quadrantName = prop;
            }
          }
          angular.forEach(allTeeth, function (item) {
            // auto-selecting permanent quadrant per BA
            if (
              item.QuadrantName === quadrantName &&
              item.ToothStructure === 'Permanent'
            ) {
              $scope.selectedTeeth.push(item);
            }
          });
        }
      });
      $scope.originalSelectedTeeth = angular.copy($scope.selectedTeeth);
    };

    // getting the full teeth list from the factory
    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        if (res && res.Value && res.Value.Teeth) {
          ctrl.addSelectedTeeth(res.Value.Teeth);
        }
      });
    };

    //#endregion

    //#region helpers

    // getting all the statuses
    ctrl.getServiceTransactionStatuses = function () {
      staticData.ServiceTransactionStatuses().then(function (res) {
        if (res && res.Value) {
          $scope.serviceTransactionStatuses = res.Value;
          ctrl.filterServiceTransactionStatuses();
        }
      });
    };

    // helper for creating service transaction dtos
    ctrl.createServiceTransaction = function (tooth, blank) {
      var toothNumber = '';
      if (tooth && tooth.USNumber) {
        toothNumber = tooth.USNumber;
      }
      var selectedSurfaces = [];
      if (tooth && !$scope.surfaceSelectionDisabled) {
        angular.forEach(tooth.SelectedSurfaces, function (ss) {
          selectedSurfaces.push(ss.Surface);
        });
      }
      var selectedRoots = [];
      if (tooth && !$scope.rootSelectionDisabled) {
        angular.forEach(tooth.SelectedRoots, function (ss) {
          selectedRoots.push(ss.Roots);
        });
      }
      // Insurance estimates needs an AccountMemberId
      var accountMemberId = '';
      if (
        $scope.patientInfo &&
        $scope.patientInfo.PersonAccount &&
        $scope.patientInfo.PersonAccount.PersonAccountMember &&
        $scope.patientInfo.PersonAccount.PersonAccountMember.AccountMemberId
      ) {
        accountMemberId =
          $scope.patientInfo.PersonAccount.PersonAccountMember.AccountMemberId;
      } else {
        accountMemberId = null;
      }
      var date = blank
        ? moment().format('MM/DD/YYYY')
        : $scope.serviceTransaction.DateEntered;

      // set current location on serviceTransaction
      var currentLocation = locationService.getCurrentLocation();
      var serviceTransaction = {
        AccountMemberId: accountMemberId,
        DateEntered: $filter('setDateTime')(date),
        Fee: blank ? null : $scope.serviceTransaction.Fee,
        LocationId: currentLocation.id,
        ProviderUserId: blank ? null : $scope.serviceTransaction.ProviderUserId,
        Roots: blank ? null : selectedRoots.toString(),
        ServiceCodeId: blank ? null : $scope.serviceTransaction.ServiceCodeId,
        ServiceTransactionId: null,
        ServiceTransactionStatusId: blank
          ? 1
          : $scope.serviceTransaction.ServiceTransactionStatusId,
        Surface: blank ? null : selectedSurfaces.toString(),
        Tooth: blank ? null : toothNumber,
        TransactionTypeId: 1,
        TreatmentPlanId: blank
          ? null
          : $scope.serviceTransaction.TreatmentPlanId,
        ObjectState: blank
          ? saveStates.Add
          : $scope.serviceTransaction.ObjectState,
      };

      //serviceTransaction.InsuranceEstimate = financialService.CreateOrCloneInsuranceEstimateObject($scope.serviceTransaction);

      return serviceTransaction;
    };

    //#endregion

    //#region service transaction(s) crud

    $scope.saveServiceTransaction = function () {
      ctrl.validateForm();
      if ($scope.formIsValid && $scope.hasServiceTransactionCreateAccess) {
        $scope.savingForm = true;
        var params = {
          Id: $scope.personId,
        };
        // set object state
        $scope.serviceTransaction.ObjectState = $scope.editMode
          ? saveStates.Update
          : saveStates.Add;
        var abbrevs = staticData.TeethQuadrantAbbreviations();
        if ($scope.editMode) {
          // the tooth selector directive will only allow one tooth to be selected at a time in edit mode
          if ($scope.selectedTeeth[0]) {
            var tooth = $scope.selectedTeeth[0];
            // adding tooth to object
            $scope.serviceTransaction.Tooth = tooth.USNumber;
            // adding surfaces to object
            if ($scope.serviceTransaction.AffectedAreaId === 4) {
              var selectedSurfaces = [];
              angular.forEach(tooth.SelectedSurfaces, function (ss) {
                selectedSurfaces.push(ss.Surface);
              });
              $scope.serviceTransaction.Surface = selectedSurfaces.toString();
            }
            // adding roots to object
            else if ($scope.serviceTransaction.AffectedAreaId === 3) {
              var selectedRoots = [];
              angular.forEach(tooth.SelectedRoots, function (ss) {
                selectedRoots.push(ss.Roots);
              });
              $scope.serviceTransaction.Roots = selectedRoots.toString();
            }
          }
          var serviceTransactionsTemp = [];
          $scope.serviceTransaction.DateEntered = $filter('setDateTime')(
            $scope.serviceTransaction.DateEntered
          );
          serviceTransactionsTemp.push($scope.serviceTransaction);
          patientServices.ServiceTransactions.update(
            { accountMemberId: $scope.serviceTransaction.AccountMemberId },
            serviceTransactionsTemp,
            ctrl.success,
            ctrl.failure
          );
        } else {
          //if (preSelectedTreatmentPlanId && $scope.serviceTransaction.TreatmentPlanId=='')
          //        {
          //             $scope.serviceTransaction.TreatmentPlanId=preSelectedTreatmentPlanId;
          //        }
          // building a temporary list of service transaction dtos
          var serviceTransactionsTemp = [];
          if (
            $scope.selectedTeeth.length > 0 &&
            !$scope.toothSelectionDisabled
          ) {
            // only sending one object in list when affected area is quadrant
            if ($scope.quadrantSelectionOnly) {
              // if affected area is quadrant the selected teeth will all be from the same quadrant, getting the quadrant abbrev from the first tooth in the list
              $scope.serviceTransaction.Tooth =
                abbrevs[$scope.selectedTeeth[0].QuadrantName];
              $scope.serviceTransaction.DateEntered = $filter('setDateTime')(
                $scope.serviceTransaction.DateEntered
              );
              serviceTransactionsTemp.push($scope.serviceTransaction);
            } else {
              angular.forEach($scope.selectedTeeth, function (tooth) {
                serviceTransactionsTemp.push(
                  ctrl.createServiceTransaction(tooth, false)
                );
              });
            }
          } else {
            serviceTransactionsTemp.push(
              ctrl.createServiceTransaction(null, false)
            );
          }
          // if the serviceTransaction has a TreatmentPlanId call TreatmentPlan add services otherwise save serviceTransaction as normal
          if (
            $scope.serviceTransaction.TreatmentPlanId &&
            !(
              preSelectedTreatmentPlan &&
              preSelectedTreatmentPlan.IsnewTreatmentPlan
            )
          ) {
            ctrl.saveServiceTransactionsToTreatmentPlans(
              serviceTransactionsTemp
            );
          } else {
            patientServices.ServiceTransactions.save(
              params,
              serviceTransactionsTemp,
              ctrl.success,
              ctrl.failure
            );
          }
        }

        ctrl.addedServicesCount++;
      }
    };

    ctrl.success = function (res) {
      if (
        preSelectedTreatmentPlan &&
        preSelectedTreatmentPlan.IsnewTreatmentPlan
      ) {
        treatmentPlansFactory.Create(res.Value, $scope.personId);
        $rootScope.$broadcast('reloadProposedServices', res.Value);
        $rootScope.$broadcast('soar:chart-services-reload-ledger');
        $scope.closeModal();
      } else {
        $scope.savingForm = false;

        var msg;
        if ($scope.editMode) {
          msg = localize.getLocalizedString('{0} {1}', [
            'Your patient service',
            'has been updated.',
          ]);
        } else {
          msg = localize.getLocalizedString('{0} {1}', [
            'Your patient service',
            'has been created.',
          ]);
        }
        toastrFactory.success(msg, localize.getLocalizedString('Success'));

        if (
          $scope.servicesCount > 1 &&
          $scope.iterationCount !== $scope.servicesCount
        ) {
          ctrl.doNextService();

          // To load ChartLedgerServices
          $rootScope.$broadcast(
            'loadChartLedgerServices:loaded',
            $scope.preSelectedServiceData.SwiftPickServiceCodes
          );
        } else {
          $scope.canCloseModal = true;
          var savedServiceTransactions = res && res.Value ? res.Value : [];
          if (savedServiceTransactions.length > 0) {
            $rootScope.$broadcast(
              'reloadProposedServices',
              savedServiceTransactions
            );
            $rootScope.$broadcast('soar:chart-services-reload-ledger');
          }
          $scope.closeModal(savedServiceTransactions);
        }
      }
    };

    ctrl.failure = function () {
      $scope.savingForm = false;
      ctrl.addedServicesCount--;
      var msg;
      if ($scope.editMode) {
        msg = localize.getLocalizedString('{0} {1}', [
          'There was an error while updating',
          'Your patient service',
        ]);
      } else {
        msg = localize.getLocalizedString('{0} {1}', [
          'There was an error while adding',
          'Your patient service',
        ]);
      }
      toastrFactory.error(msg, localize.getLocalizedString('Server Error'));
    };

    //#endregion

    //#region validation

    /*var test = [
            {"Id": 1, "Name": "Mouth", "Order": 1},
            {"Id": 2, "Name": "Quadrant", "Order": 2},
            {"Id": 3, "Name": "Root", "Order": 3},
            {"Id": 4, "Name": "Surface", "Order": 4 },
            {"Id": 5, "Name": "Tooth", "Order": 5}
        ];*/

    // called every time a new service is selected, ensuring that the correct controls are active
    ctrl.setDisabledFlags = function (selectedService) {
      $scope.quadrantSelectionOnly = false;
      if (selectedService) {
        switch (selectedService.AffectedAreaId) {
          case 2:
            $scope.toothSelectionDisabled = false;
            $scope.quadrantSelectionOnly = true;
            break;
          case 3:
            $scope.toothSelectionDisabled = false;
            $scope.rootSelectionDisabled = false;
            break;
          case 4:
            $scope.toothSelectionDisabled = false;
            $scope.surfaceSelectionDisabled = false;
            break;
          case 5:
            $scope.toothSelectionDisabled = false;
            break;
          default:
            //  $scope.selectedTeeth = [];
            $scope.toothSelectionDisabled = true;
            $scope.rootSelectionDisabled = true;
            $scope.surfaceSelectionDisabled = true;
            break;
        }
      } else {
        // $scope.selectedTeeth = [];
        $scope.toothSelectionDisabled = true;
        $scope.rootSelectionDisabled = true;
        $scope.surfaceSelectionDisabled = true;
      }
    };

    // used to determine whether or not the 'are you sure' modal should appear
    ctrl.checkForChanges = function () {
      // a little manipulation required before comparison
      var selectedTeethTemp = angular.copy($scope.selectedTeeth);
      angular.forEach(selectedTeethTemp, function (tooth) {
        if (!$scope.editMode) {
          delete tooth.Selected;
          delete tooth.SelectedSurfaces;
          delete tooth.SelectedRoots;
        } else {
          delete tooth.Surfaces;
        }
      });
      if (
        $scope.editMode &&
        !$scope.serviceTransaction.Fee &&
        !$scope.originalServiceTransaction.Fee
      ) {
        $scope.serviceTransaction.Fee = null;
        $scope.originalServiceTransaction.Fee = null;
      }
      if (
        $scope.editMode &&
        !$scope.serviceTransaction.TreatmentPlanId &&
        !$scope.originalServiceTransaction.TreatmentPlanId
      ) {
        $scope.serviceTransaction.TreatmentPlanId = null;
        $scope.originalServiceTransaction.TreatmentPlanId = null;
      }
      if (
        $scope.serviceTransaction.Fee === '' ||
        angular.isUndefined($scope.serviceTransaction.Fee)
      ) {
        $scope.serviceTransaction.Fee = null;
      }
      if (!angular.isUndefined($scope.originalServiceTransaction)) {
        if (
          angular.isUndefined($scope.originalServiceTransaction.Fee) ||
          $scope.originalServiceTransaction.Fee === ''
        ) {
          $scope.originalServiceTransaction.Fee = null;
        }
      }
      if (
        $scope.serviceTransaction.TreatmentPlanId === '' ||
        angular.isUndefined($scope.serviceTransaction.TreatmentPlanId)
      ) {
        $scope.serviceTransaction.TreatmentPlanId = null;
      }
      if (!angular.isUndefined($scope.originalServiceTransaction)) {
        if (
          $scope.originalServiceTransaction.TreatmentPlanId === '' ||
          angular.isUndefined($scope.originalServiceTransaction.TreatmentPlanId)
        ) {
          $scope.originalServiceTransaction.TreatmentPlanId = null;
        }
      }
      if (
        angular.equals(selectedTeethTemp, $scope.originalSelectedTeeth) &&
        angular.equals(
          $scope.serviceTransaction,
          $scope.originalServiceTransaction
        )
      ) {
        $scope.canCloseModal = true;
      } else {
        $scope.canCloseModal = false;
      }
    };

    // check that all teeth have * selected
    ctrl.allTeethHave = function (property) {
      var returnVal = true;
      angular.forEach($scope.selectedTeeth, function (tooth) {
        if (!tooth[property] || tooth[property].length === 0) {
          returnVal = false;
        }
      });
      return returnVal;
    };

    // validator method
    ctrl.validateForm = function () {
      if (
        !$scope.serviceTransaction ||
        !$scope.serviceTransaction.ServiceCodeId
      ) {
        $scope.formIsValid = false;
      } else if (
        !$scope.toothSelectionDisabled &&
        (!$scope.selectedTeeth || $scope.selectedTeeth.length === 0)
      ) {
        $scope.formIsValid = false;
      } else if (
        !$scope.surfaceSelectionDisabled &&
        ctrl.allTeethHave('SelectedSurfaces') === false
      ) {
        $scope.formIsValid = false;
      } else if (
        !$scope.rootSelectionDisabled &&
        ctrl.allTeethHave('SelectedRoots') === false
      ) {
        $scope.formIsValid = false;
      } else if ($scope.validDate === false) {
        $scope.formIsValid = false;
      } else if (
        !$scope.serviceTransaction.ProviderUserId &&
        $scope.existingServiceTransactionStatus !== true
      ) {
        $scope.formIsValid = false;
      } else {
        $scope.formIsValid = true;
      }
    };

    // setting formIsValid flag based on validDate controlled by the date picker
    $scope.$watch('validDate', function (nv, ov) {
      $scope.formIsValid = nv === true ? true : false;
    });

    //#endregion

    //#region handle close

    // close and pass saved plannedService
    $scope.closeModal = function (savedServiceTransactions) {
      $uibModalInstance.close(savedServiceTransactions);
    };

    // close dialog on cancel
    $scope.showCancelModal = function () {
      modalFactory.CancelModal().then($scope.confirmCancel);
    };

    //
    $scope.confirmCancel = function () {
      $uibModalInstance.close(null);
    };

    //
    $scope.cancelChanges = function () {
      ctrl.checkForChanges();
      if ($scope.canCloseModal) {
        if ($scope.servicesCount > 1 && ctrl.addedServicesCount > 0) {
          $uibModalInstance.close({});
        } else {
          $uibModalInstance.close(null);
        }
      } else {
        modalFactory.CancelModal().then($scope.confirmCancel);
      }
    };

    //#endregion

    //#region listeners

    //
    $scope.$on('selectedTeeth-modified', function (event, nv) {
      // auto-select all roots for all selected teeth
      angular.forEach(nv, function (tooth) {
        var toothInOldList = listHelper.findItemByFieldValue(
          $scope.selectedTeethOld,
          'ToothId',
          tooth.ToothId
        );
        if (!toothInOldList) {
          tooth.SelectedRoots = [];
          angular.forEach(tooth.RootAbbreviations, function (abbrev) {
            tooth.SelectedRoots.push({
              Roots: abbrev,
            });
            if ($scope.editMode && !tooth.SelectedRootsLoaded) {
              tooth.SelectedRootsLoaded = true;
            }
          });
        }
      });
      $scope.selectedTeeth = nv;
      $scope.selectedTeethOld = angular.copy($scope.selectedTeeth);
      ctrl.validateForm();
    });

    // prevent empty lists
    $scope.$on('providers:loaded', function (event, providerList) {
      $scope.providers = $filter('filter')(providerList, {
        IsActive: true,
      });
    });

    //
    $scope.$watch(
      'serviceTransaction.ServiceTransactionStatusId',
      function (nv, ov) {
        if (nv === '') {
          $scope.serviceTransaction.ServiceTransactionStatusId = 1;
        }
        ctrl.applyServiceTransactionRules(nv);
        ctrl.validateForm();
      }
    );

    // validating form every time provider changes
    $scope.$watch('serviceTransaction.ProviderUserId', function (nv, ov) {
      ctrl.validateForm();
    });

    $scope.$watch('serviceTransaction.TreatmentPlanId', function (nv, ov) {
      if (nv && nv != '') {
        ctrl.getTreatmentplanStages(nv);
      } else if (nv == '') {
        $scope.planStages = [];
        $scope.stageSelected = null;
      }
    });
    //#endregion

    // #region service code typeahead/selection

    $scope.clearSelectedService = function () {
      //clear search term
      $scope.searchData.searchTerm = '';

      $scope.serviceTransaction.Fee = null;
      $scope.serviceTransaction.ServiceCodeId = null;
      $scope.selectedService = null;
      ctrl.setDisabledFlags($scope.selectedService);
      ctrl.validateForm();
      $scope.bFocus = true;
    };

    ctrl.isPreferred = function (dataItem) {
      return (
        $scope.patientInfo &&
        (dataItem.UserId === $scope.patientInfo.PreferredDentist ||
          dataItem.UserId === $scope.patientInfo.PreferredHygienist)
      );
    };

    // the service-codes-search directive calls this when a service is selected
    $scope.selectResult = function (selectedService) {
      var deferred = $q.defer();
      if (selectedService) {
        referenceDataService
          .getData(referenceDataService.entityNames.serviceCodes)
          .then(function (serviceCodes) {
            var serviceCode = _.find(serviceCodes, {
              ServiceCodeId: selectedService.ServiceCodeId,
            });
            if (serviceCode) {
              selectedService = serviceCode;

              $scope.selectAutoFocus.value = false;

              $scope.serviceTransaction.Fee = selectedService.$$serviceTransactionFee
                ? selectedService.$$serviceTransactionFee
                : null;
              $scope.serviceTransaction.ServiceCodeId =
                selectedService.ServiceCodeId;
              $scope.selectedService =
                selectedService.Code + ' - ' + selectedService.Description;

              var providersToFilter = angular.copy($scope.providers);
              angular.forEach(providersToFilter, function (provider) {
                provider.IsPreferred = ctrl.isPreferred(provider);
              });
              var selectedUsuallyPerformedProviders = providersToFilter.filter(
                function (p) {
                  return (
                    p.ProviderTypeId ==
                      selectedService.UsuallyPerformedByProviderTypeId &&
                    p.IsPreferred
                  );
                }
              );
              if (selectedUsuallyPerformedProviders.length > 0) {
                $scope.serviceTransaction.ProviderUserId =
                  selectedUsuallyPerformedProviders[0].UserId;
              }

              ctrl.setDisabledFlags(selectedService);
              ctrl.validateForm();
            }
            deferred.resolve();
          });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    };

    //#endregion

    ctrl.setPreselectedTreatmentPlan = function (plans) {
      if (
        preSelectedTreatmentPlan &&
        preSelectedTreatmentPlan.IsnewTreatmentPlan
      ) {
        preSelectedTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId =
          preSelectedTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName;
        preSelectedTreatmentPlan.ServicesCount = 0;
        preSelectedTreatmentPlan.ServicesFees = 0;
        plans.push(preSelectedTreatmentPlan);
      }
    };

    //#region treatment plan headers get

    // success callback for get treatment plan headers
    ctrl.getTreatmentPlanHeadersSuccess = function (res) {
      if (res && res.Value) {
        $scope.treatmentPlanHeaders = res.Value;
        if (
          preSelectedTreatmentPlan &&
          preSelectedTreatmentPlan.IsnewTreatmentPlan
        ) {
          preSelectedTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId =
            preSelectedTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName;
          preSelectedTreatmentPlan.ServicesCount = 0;
          preSelectedTreatmentPlan.ServicesFees = 0;
          $scope.treatmentPlanHeaders.push(preSelectedTreatmentPlan);
        }
        angular.forEach(
          $scope.treatmentPlanHeaders,
          function (treatmentPlanHeader) {
            ctrl.buildTreatmentPlanDescription(treatmentPlanHeader);
          }
        );
      }
      // preSelectedTreatmentPlan is passed in when user has chosen to add a service from the txPlan crud
      $timeout(function () {
        if (preSelectedTreatmentPlan)
          $scope.serviceTransaction.TreatmentPlanId = preSelectedTreatmentPlan
            .TreatmentPlanHeader.TreatmentPlanId
            ? preSelectedTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId
            : null;
      }, 1000);
    };

    // failure callback for gettreatment plan headers
    ctrl.getTreatmentPlanHeadersFailure = function () {
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
        if (txplan.TreatmentPlanHeader.TreatmentPlanId == planId) {
          Stages = treatmentPlansFactory.GetPlanStages();
        }
      });
      if (Stages.length == 0) {
        Stages.push({ stageno: 1 });
      }
      $scope.planStages = angular.copy($filter('orderBy')(Stages, 'stageno'));
      $scope.stageSelected = $scope.planStages[0].stageno;
    };

    // getting treatment plan headers for patient
    ctrl.getTreatmentPlanHeaders = function () {
      if ($scope.hasTreatmentPlanHeadersAddServicesAccess && !$scope.editMode) {
        patientServices.TreatmentPlans.getHeadersWithServicesSummary(
          { Id: $scope.personId },
          ctrl.getTreatmentPlanHeadersSuccess,
          ctrl.getTreatmentPlanHeadersFailure
        );
      }
    };

    //#endregion

    //#region load service transactions to treatmentPlanServices

    ctrl.loadServiceTransactionsToTreatmentPlanServices = function (
      serviceTransactions
    ) {
      var treatmentPlanHeader = ctrl.getSelectedTreatmentPlanHeader(
        serviceTransactions[0].TreatmentPlanId
      );
      var treatmentPlanServiceHeader = {
        TreatmentPlanId: treatmentPlanHeader.TreatmentPlanId,
        PersonId: treatmentPlanHeader.PersonId,
        TreatmentPlanGroupNumber: $scope.stageSelected,
      };
      var treatmentPlanServices = [];

      angular.forEach(serviceTransactions, function (serviceTransaction) {
        var treatmentPlanService = {
          ServiceTransaction: serviceTransaction,
          TreatmentPlanServiceHeader: treatmentPlanServiceHeader,
        };
        treatmentPlanServices.push(treatmentPlanService);
      });
      return treatmentPlanServices;
    };

    //#endregion

    //#region save serviceTransactions to treatmentPlans

    // success callback for add service
    ctrl.addServiceSuccess = function (res) {
      if (res && res.Value && res.Value[0]) {
        var treatmentPlanServices = res.Value;
        angular.forEach(treatmentPlanServices, function (service) {
          service.ServiceTransaction.InsuranceEstimates = financialService.CreateInsuranceEstimateObject(
            service.ServiceTransaction
          );
        });
        $scope.savingForm = false;
        $scope.canCloseModal = true;
        $rootScope.$broadcast(
          'soar:tx-plan-services-changed',
          treatmentPlanServices,
          true
        );
        toastrFactory.success(
          localize.getLocalizedString('The {0} has been added to your {1}', [
            'proposed service',
            'treatment plan',
          ]),
          localize.getLocalizedString('Success')
        );
        if (treatmentPlanServices.length > 0) {
          var serviceTransactionstoLoad = [];
          angular.forEach(treatmentPlanServices, function (tps) {
            serviceTransactionstoLoad.push(tps.ServiceTransaction);
          });
          $rootScope.$broadcast(
            'reloadProposedServices',
            serviceTransactionstoLoad
          );
        }
        $scope.closeModal(treatmentPlanServices);
      }
    };

    // failure callback for add service
    ctrl.addServiceFailure = function () {
      $scope.savingForm = false;
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error while adding the proposed service to your {0}',
          ['treatment plan']
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    // save the treatmentPlanServices
    ctrl.saveServiceTransactionsToTreatmentPlans = function (
      serviceTransactions
    ) {
      if ($scope.hasTreatmentPlanHeadersAddServicesAccess) {
        var treatmentPlanServices = [];
        treatmentPlanServices = ctrl.loadServiceTransactionsToTreatmentPlanServices(
          serviceTransactions
        );

        patientServices.TreatmentPlans.addServices(
          {
            Id: $scope.personId,
            TreatmentPlanId: serviceTransactions[0].TreatmentPlanId,
          },
          treatmentPlanServices,
          ctrl.addServiceSuccess,
          ctrl.addServiceFailure
        );
      }
    };

    //#endregion

    //#region treatmentPlanHeaders selection

    $scope.treatmentPlan = {
      TreatmentPlanServices: {
        TreatmentPlanServiceHeader: {},
        ServiceTransaction: {},
      },
    };

    ctrl.getSelectedTreatmentPlanHeader = function (treatmentPlanHeaderId) {
      var treatementPlanHeader = {};
      angular.forEach(
        $scope.treatmentPlanHeaders,
        function (treatmentPlanHeaderSummary) {
          if (
            treatmentPlanHeaderSummary.TreatmentPlanHeader.TreatmentPlanId ===
            treatmentPlanHeaderId
          ) {
            treatementPlanHeader =
              treatmentPlanHeaderSummary.TreatmentPlanHeader;
          }
        }
      );
      return treatementPlanHeader;
    };

    //#endregion

    ctrl.buildTreatmentPlanDescription = function (treatmentPlanHeaderSummary) {
      var displayName =
        treatmentPlanHeaderSummary.TreatmentPlanHeader.TreatmentPlanName +
        ' | ';
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

    //#region existing status

    $scope.filteredServiceTransactionStatuses = [];
    ctrl.filterServiceTransactionStatuses = function () {
      angular.forEach($scope.serviceTransactionStatuses, function (status) {
        if (status.Id === 6 || status.Id === 1) {
          $scope.filteredServiceTransactionStatuses.push(status);
        }
      });
    };

    $scope.existingServiceTransactionStatus = false;
    ctrl.applyServiceTransactionRules = function (statusId) {
      if (statusId == '6') {
        $scope.existingServiceTransactionStatus = true;
        $scope.serviceTransaction.ProviderUserId = null;
        $scope.serviceTransaction.Fee = null;
        $scope.serviceTransaction.TreatmentPlanId = null;
      } else {
        $scope.existingServiceTransactionStatus = false;
      }
    };

    //#endregion

    //#region call init

    ctrl.init();

    //#endregion
  },
]);
