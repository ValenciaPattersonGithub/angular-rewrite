'use strict';
angular
  .module('Soar.Patient')
  .controller('TransactionCrudController', [
    '$scope',
    'localize',
    'ListHelper',
    'ModalFactory',
    'ModalDataFactory',
    'PatientServices',
    'ClaimsService',
    'CloseClaimService',
    '$filter',
    'toastrFactory',
    'tabLauncher',
    'DataForModal',
    '$uibModalInstance',
    '$timeout',
    'SaveStates',
    'patSecurityService',
    '$location',
    'StaticData',
    'SurfaceHelper',
    'RootHelper',
    '$q',
    'FinancialService',
    'PatientValidationFactory',
    'locationService',
    'PatientOdontogramFactory',
    'PatientServicesFactory',
    'referenceDataService',
    'userSettingsDataService',
    'TimeZoneFactory',
    /**
     *
     * @param {*} $scope
     * @param {*} localize
     * @param {*} listHelper
     * @param {*} modalFactory
     * @param {*} modalDataFactory
     * @param {*} patientServices
     * @param {*} claimsService
     * @param {*} closeClaimService
     * @param {angular.IFilterService} $filter
     * @param {*} toastrFactory
     * @param {*} tabLauncher
     * @param {*} dataForModal
     * @param {*} $uibModalInstance
     * @param {angular.ITimeoutService} $timeout
     * @param {*} saveStates
     * @param {*} patSecurityService
     * @param {*} $location
     * @param {*} staticData
     * @param {*} surfaceHelper
     * @param {*} rootHelper
     * @param {angular.IQService} $q
     * @param {*} financialService
     * @param {*} patientValidationFactory
     * @param {*} locationService
     * @param {*} patientOdontogramFactory
     * @param {*} patientServicesFactory
     * @param {{ getData: (entity: string) => angular.IPromise<any>; entityNames: Record<string, string>; }} referenceDataService
     * @param {*} userSettingsDataService
     * @param {*} timeZoneFactory
     */
    function (
      $scope,
      localize,
      listHelper,
      modalFactory,
      modalDataFactory,
      patientServices,
      claimsService,
      closeClaimService,
      $filter,
      toastrFactory,
      tabLauncher,
      dataForModal,
      $uibModalInstance,
      $timeout,
      saveStates,
      patSecurityService,
      $location,
      staticData,
      surfaceHelper,
      rootHelper,
      $q,
      financialService,
      patientValidationFactory,
      locationService,
      patientOdontogramFactory,
      patientServicesFactory,
      referenceDataService,
      userSettingsDataService,
      timeZoneFactory
    ) {
      //#region Member Variables
      var ctrl = this;
      $scope.editingTransaction = false;
      $scope.validateFlag = false;
      $scope.alreadySaving = false;
      $scope.taxLoading = false;
      $scope.previousAmountChanged = false;
      $scope.isSaveButtonclicked = false;
      $scope.displayVariables = { showTeethDetail: false };

      $scope.hasValueChanged =
        dataForModal.Transaction.TransactionTypeId == 5 ? false : true;

      $scope.editMode = dataForModal.EditMode;
      ctrl.currentTransactionTypeId =
        dataForModal.Transaction.TransactionTypeId;
      $scope.adjustmentTypes = []; //dataForModal.AdjustmentTypes;

      // Operate on all provider list and build object of required providers
      $scope.providers = [];
      $scope.patientInfo = dataForModal.Patient;
      ctrl.todaysDate = moment();
      $scope.originalTransactionObject = angular.copy(dataForModal.Transaction);

      ctrl.filterTypes = {
        Active: 1,
        Inactive: 2,
      };

      $scope.providerOnClaimsOnChange = function (
        providerOnClaimsId,
        transaction
      ) {
        if (!_.isNil(providerOnClaimsId)) {
          transaction.ProviderOnClaimsId = providerOnClaimsId;
        }
      };

      $scope.$watch(
        'transaction',
        function (newVal) {
          $scope.checkServiceLocation();

          if (ctrl.currentTransactionTypeId) {
              $scope.hasValueChanged = ctrl.transactionHasChanged(newVal, 
                $scope.originalTransactionObject);
          }
          if (newVal.InProcess) {
            newVal.disableMessage =
              'This service is attached to a claim that is InProcess and it cannot be edited or deleted';
          } else if (newVal.IsAuthorized) {
            newVal.disableMessage =
              'Credit/Debit card returns cannot be edited or deleted';
          } else if (ctrl.currentTransactionTypeId === 5 && $scope.transaction.Description.toLowerCase().indexOf('vendor payment refund') !== -1) {
              newVal.disableMessage = 'This debit originated from a third party vendor and it cannot be edited.';
          } else if (ctrl.currentTransactionTypeId === 5 && !$scope.serviceLocationMatch) {
            newVal.disableMessage = 'Your current location does not match this adjustment\'s location.';
          } else {
            newVal.disableMessage = null;
          }
        },
        true
      );

      ctrl.transactionHasChanged = function (current, original) {
        return (
          !_.isEqual(current.DateEntered, original.DateEntered) ||
          !_.isEqual(current.ProviderUserId, original.ProviderUserId) ||
          !_.isEqual(current.ProviderOnClaimsId, original.ProviderOnClaimsId) ||
          !_.isEqual(current.AdjustmentTypeId, original.AdjustmentTypeId) ||
          !_.isEqual(current.Note, original.Note) ||
          !_.isEqual(current.Amount, original.Amount) ||
          !_.isEqual(current.Tooth, original.Tooth) ||
          !_.isEqual(current.Roots, original.Roots) ||
          !surfaceHelper.areSurfaceCSVsEqual(
            current.Surface,
            original.Surface
          ) ||
          !_.isEqual(current.TotalEstInsurance, original.TotalEstInsurance)
        );
      };

      ctrl.soarServiceAuthEditKey = 'soar-acct-actsrv-edit';
      ctrl.soarServiceAuthViewKey = 'soar-acct-actsrv-view';

      ctrl.soarDebitAuthEditKey = 'soar-acct-dbttrx-edit';
      ctrl.soarDebitAuthViewKey = 'soar-acct-dbttrx-view';
      $scope.soarAuthClaimViewKey = 'soar-ins-iclaim-view';

      if (ctrl.currentTransactionTypeId === 1) {
        $scope.soarAuthEditKey = ctrl.soarServiceAuthEditKey;
        $scope.soarAuthViewKey = ctrl.soarServiceAuthViewKey;
      } else if (
        ctrl.currentTransactionTypeId === 5 ||
        ctrl.currentTransactionTypeId == 6
      ) {
        $scope.soarAuthEditKey = ctrl.soarDebitAuthEditKey;
        $scope.soarAuthViewKey = ctrl.soarDebitAuthViewKey;
      }

      if (ctrl.currentTransactionTypeId === 5) {
        angular.forEach(
          dataForModal.AdjustmentTypes,
          function (adjustmentType) {
            if (adjustmentType.IsPositive) {
              $scope.adjustmentTypes.push(adjustmentType);
            }
          }
        );
      }
      //#endregion

      //#region Authorization
      // Check if logged in user has view access to this page

      ctrl.authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthViewKey
        );
      };

      // Check if logged in user has view access to this page
      ctrl.authEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthEditKey
        );
      };

      //Notify user, he is not authorized to access current area
      ctrl.notifyNotAuthorized = function (authMessageKey) {
        toastrFactory.error(
          patSecurityService.generateMessage(authMessageKey),
          'Not Authorized'
        );
        $location.path('/');
      };

      ctrl.authAccess = function () {
        //Authorize user from edit or view access
        if ($scope.editMode) {
          ctrl.hasViewOrEditAccessTransaction = ctrl.authEditAccess();
        } else {
          ctrl.hasViewOrEditAccessTransaction = ctrl.authViewAccess();
        }
        if (!ctrl.hasViewOrEditAccessTransaction) {
          ctrl.notifyNotAuthorized(
            $scope.editMode ? $scope.soarAuthEditKey : $scope.soarAuthViewKey
          );
        }
      };

      // authorization
      ctrl.authAccess();

      // #endregion

      //#region Initialize Providers
      // Get transaction's enteredBy user's name as per standard practice rules.
      ctrl.getProviderName = function (enteredByUserId) {
        var name = '';
        var provider = listHelper.findItemByFieldValue(
          ctrl.providers,
          'UserId',
          enteredByUserId
        );
        if (provider != null) {
          name = provider.Name;
        }
        return name;
      };

      /**
       * ctrl.providers is used for display only
       *
       * @returns {angular.IPromise}
       */
      ctrl.filteredProviders = function () {
        return referenceDataService
          .getData(referenceDataService.entityNames.users)
          .then(function (allProvidersList) {
            var filteredProviderList = _.filter(
              allProvidersList,
              function (provider) {
                return provider.Locations.length > 0;
              }
            );
            _.forEach(filteredProviderList, function (provider) {
              provider.Name =
                provider.FirstName +
                ' ' +
                provider.LastName +
                (provider.ProfessionalDesignation
                  ? ', ' + provider.ProfessionalDesignation
                  : '');
            });
            filteredProviderList = $filter('orderBy')(
              filteredProviderList,
              'Name'
            );
            ctrl.providers = _.cloneDeep(filteredProviderList);
          });
      };
      // Initialize filtered providers
      ctrl.filteredProviders();
      //#endregion

      //#region Initialize Selected Transaction

      // Filter out adjustment types by flag
      ctrl.filterOutAdjustmentTypes = function (id, filter) {
        // Filter out inactive adjustment types
        if (_.isEqual(filter, 2)) {
          $scope.adjustmentTypes = _.filter(
            $scope.adjustmentTypes,
            function (type) {
                return (type.IsActive === true && type.Description.toLowerCase().indexOf('vendor payment refund') === -1) || type.AdjustmentTypeId === id;
            }
          );
        }
      };

      // DateEntered manipulation required by bug 433188

      /**
       * gets timezone for a specific location
       *
       * @returns {angular.IPromise<string>}
       */
      ctrl.getLocationTimezone = function () {
        //Getting the list of locations then filtering for the currently logged in location
        return referenceDataService
          .getData(referenceDataService.entityNames.locations)
          .then(function (locations) {
            var userLocation = JSON.parse(
              sessionStorage.getItem('userLocation')
            );
            var ofcLocation = _.find(locations, {
              LocationId: userLocation.id,
            });
            var locationTimezone = ofcLocation ? ofcLocation.Timezone : '';
            return locationTimezone;
          });
      };

      /**
       * displayDateEntered is the timezone adjusted DateEntered for display.
       * if displayDateEntered changes set the DateEntered to the new date so that it is always ready to save
       *
       * @param {*} newDate
       */
      $scope.resetDateEntered = function (newDate) {
        if (newDate !== $scope.displayDateEntered) {
          ctrl.getLocationTimezone().then(function (locationTimezone) {
            $scope.displayDateEntered = newDate;
            $scope.transaction.DateEntered = timeZoneFactory.ConvertDateToSave(
              newDate,
              locationTimezone
            );
          });
        }
      };

      $scope.loadingDisplayProperties = true;

      /**
       * Function to set properties for display on modal and create transaction backup object
       *
       * @returns {angular.IPromise}
       */
      ctrl.setDisplayPropertiesForSelectedTransaction = function () {
        $scope.loadingDisplayProperties = true;
        $scope.transaction = angular.copy(dataForModal.Transaction);

        return ctrl.getLocationTimezone().then(function (locationTimezone) {
          // set $scope.displayDateEntered based on location timezone, this is date used for calendar control
          $scope.displayDateEntered = timeZoneFactory.ConvertDateToMomentTZ(
            $scope.transaction.DateEntered,
            locationTimezone
          );
          // set backup to match since we use this to determine if data has changed
          $scope.originalTransactionObject.DateEntered = _.cloneDeep(
            $scope.transaction.DateEntered
          );
          ctrl.transactionInitialCopy = angular.copy(dataForModal.Transaction);
          // set backup to match since we use this to determine if data has changed also
          ctrl.transactionInitialCopy.DateEntered = _.cloneDeep(
            $scope.transaction.DateEntered
          );
          $scope.transaction.ValidDate = true;
          $scope.transaction.Provider = ctrl.getProviderName(
            $scope.transaction.ProviderUserId
          );
          $scope.transaction.ProviderOnClaims = ctrl.getProviderName(
            $scope.transaction.ProviderOnClaimsId
          );
          var serviceCode = listHelper.findItemByFieldValue(
            dataForModal.ServiceCodes,
            'ServiceCodeId',
            $scope.transaction.ServiceCodeId
          );
          if (serviceCode != null) {
            // if from transaction history the CdtCodeName won't be present so add here.
            $scope.transaction.CdtCodeName = $scope.transaction.CdtCodeName
              ? $scope.transaction.CdtCodeName
              : serviceCode.CdtCodeName;
            $scope.transaction.AffectedAreaId = serviceCode.AffectedAreaId;
            $scope.transaction.UseCodeForRangeOfTeeth =
              serviceCode.UseCodeForRangeOfTeeth;
            var serviceType = listHelper.findItemByFieldValue(
              dataForModal.ServiceTypes,
              'ServiceTypeId',
              serviceCode.ServiceTypeId
            );

            if (serviceType != null) {
              $scope.transaction.ServiceType = serviceType.Description;
            }
          }

          if ($scope.transaction.TransactionTypeId === 5) {
            $scope.transaction.TransactionType = localize.getLocalizedString(
              'Positive (+) Adjustment'
            );
            var adjustmentType = listHelper.findItemByFieldValue(
              $scope.adjustmentTypes,
              'AdjustmentTypeId',
              $scope.transaction.AdjustmentTypeId
            );
            if (adjustmentType) {
              $scope.transaction.AdjustmentTypeName =
                adjustmentType.Description;
            }
          } else if ($scope.transaction.TransactionTypeId === 6) {
            $scope.transaction.TransactionType = localize.getLocalizedString(
              'Finance Charge'
            );
            $scope.transaction.AdjustmentTypeName =
              $scope.transaction.TransactionType;
          }
          //make object schema match when cancelling by adding the 'disableMessage' property
          ctrl.transactionInitialCopy.disableMessage = null;
          if ($scope.editMode) {
            ctrl.filterOutAdjustmentTypes(
              $scope.transaction.AdjustmentTypeId,
              ctrl.filterTypes.Inactive
            );
          }
          $scope.loadingDisplayProperties = false;
        });
      };
      // Initialize transaction's display properties
      ctrl.setDisplayPropertiesForSelectedTransaction();
      //#endregion

      // #region - default focus
      ctrl.defaultFocus = function () {
        $timeout(function () {
          if ($scope.editMode)
            angular.element('#inpTransactionDate').find('input').focus();
        }, 100);
      };
      ctrl.defaultFocus();
      //#endregion

      //#region Validate Transaction

      /**
       * Initialize min and max dates for validation
       *
       * @returns {angular.IPromise}
       */
      ctrl.setTransactionMinAndMaxDates = function () {
        return ctrl.getLocationTimezone().then(function (locationTimezone) {
          var todaysDate = timeZoneFactory.ConvertDateToMomentTZ(
            ctrl.todaysDate,
            locationTimezone
          );
          $scope.transactionMaxDate = moment([
            todaysDate.year(),
            todaysDate.month(),
            todaysDate.date(),
            0,
            0,
            0,
            0,
          ]);
          $scope.tansactionMinDate = moment()
            .add(-100, 'years')
            .startOf('day')
            .toDate();
        });
      };

      ctrl.setTransactionMinAndMaxDates();
      //Validate transaction object; return true if valid else return false.

      ctrl.getTeethDefinitions = function () {
        staticData.TeethDefinitions().then(function (res) {
          if (res && res.Value && res.Value.Teeth) {
            $scope.allTeeth = res.Value.Teeth;
          }
        });
      };
      ctrl.getTeethDefinitions();

      ctrl.getClaimsAndPlans = function () {
        if (
          dataForModal.Transaction.ServiceTransactionId !== null &&
          dataForModal.Transaction.ServiceTransactionId !== undefined
        ) {
          var promise1 = patientServices.Claim.getClaimsByServiceTransaction({
            serviceTransactionId: dataForModal.Transaction.ServiceTransactionId,
            claimType: 1,
          }).$promise.then(function (res) {
            ctrl.claims = res.Value;
          });
          var promise2 = patientServices.PatientBenefitPlan.getBenefitPlansRecordsByAccountId(
            { accountId: $scope.patientInfo.PersonAccount.AccountId }
          ).$promise.then(function (res) {
            ctrl.plans = res.Value;
          });

          $q.all([promise1, promise2]).then(function () {
            ctrl.updateAllowedAmountDisplay();
          });
        }
      };
      ctrl.getClaimsAndPlans();

      ctrl.updateAllowedAmountDisplay = function () {
        $scope.allowedAmountDisplay = null;
        var plans = ctrl.plans;
        var claims = ctrl.claims;

        if (claims !== null && claims !== undefined) {
          if (claims.length > 0) {
            if (
              $scope.transaction.InsuranceEstimates !== null &&
              $scope.transaction.InsuranceEstimates !== undefined
            ) {
              if ($scope.transaction.InsuranceEstimates.length === 1) {
                if (
                  $scope.transaction.InsuranceEstimates[0].AllowedAmount !==
                    null &&
                  $scope.transaction.InsuranceEstimates[0].AllowedAmount !==
                    undefined
                ) {
                  $scope.allowedAmountDisplay =
                    $scope.transaction.InsuranceEstimates[0]
                      .AllowedAmountOverride !== null &&
                    $scope.transaction.InsuranceEstimates[0]
                      .AllowedAmountOverride !== undefined
                      ? $scope.transaction.InsuranceEstimates[0]
                          .AllowedAmountOverride
                      : $scope.transaction.InsuranceEstimates[0].AllowedAmount;
                }
              }
              if ($scope.transaction.InsuranceEstimates.length === 2) {
                //two (or more?) claims = compare both estimates
                if (
                  claims.length > 1 &&
                  claims.some(x => x.PatientBenefitPlanPriority === 0) &&
                  claims.some(x => x.PatientBenefitPlanPriority === 1)
                ) {
                  $scope.allowedAmountDisplay = ctrl.compareEstimates(
                    $scope.transaction.InsuranceEstimates
                  );
                }
                //one claim
                else if (claims.length === 1) {
                  //two(or more ?) plans on account = compare both estimates
                  if (plans !== null && plans !== undefined) {
                    if (plans.length > 1) {
                      $scope.allowedAmountDisplay = ctrl.compareEstimates(
                        $scope.transaction.InsuranceEstimates
                      );
                      return;
                    }
                  }
                  //one claim only = use estimate with claim
                  var estimate = $scope.transaction.InsuranceEstimates.find(
                    x =>
                      x.PatientBenefitPlanId === claims[0].PatientBenefitPlanId
                  );

                  if (estimate !== null && estimate !== undefined) {
                    if (
                      estimate.AllowedAmount !== null &&
                      estimate.AllowedAmount !== undefined
                    ) {
                      $scope.allowedAmountDisplay =
                        estimate.AllowedAmountOverride !== null &&
                        estimate.AllowedAmountOverride !== undefined
                          ? estimate.AllowedAmountOverride
                          : estimate.AllowedAmount;
                    }
                  }
                }
              }
            }
          }
        }
      };

      ctrl.compareEstimates = function (estimates) {
        var allowedAmount;

        if (
          estimates[0].AllowedAmount !== null &&
          estimates[0].AllowedAmount !== undefined &&
          estimates[1].AllowedAmount !== null &&
          estimates[1].AllowedAmount !== undefined
        ) {
          var comparisonArray = [];

          estimates[0].AllowedAmountOverride !== null &&
          estimates[0].AllowedAmountOverride !== undefined
            ? comparisonArray.push(estimates[0].AllowedAmountOverride)
            : comparisonArray.push(estimates[0].AllowedAmount);
          estimates[1].AllowedAmountOverride !== null &&
          estimates[1].AllowedAmountOverride !== undefined
            ? comparisonArray.push(estimates[1].AllowedAmountOverride)
            : comparisonArray.push(estimates[1].AllowedAmount);

          allowedAmount = Math.min.apply(Math, comparisonArray);
        } else if (
          estimates[0].AllowedAmount !== null &&
          estimates[0].AllowedAmount !== undefined
        ) {
          allowedAmount =
            estimates[0].AllowedAmountOverride !== null &&
            estimates[0].AllowedAmountOverride !== undefined
              ? estimates[0].AllowedAmountOverride
              : estimates[0].AllowedAmount;
        } else if (
          estimates[1].AllowedAmount !== null &&
          estimates[1].AllowedAmount !== undefined
        ) {
          allowedAmount =
            estimates[1].AllowedAmountOverride !== null &&
            estimates[1].AllowedAmountOverride !== undefined
              ? estimates[1].AllowedAmountOverride
              : estimates[1].AllowedAmount;
        }

        return allowedAmount;
      };

      $scope.$watch('transaction.Surface', function () {
        $scope.transaction.invalidSurface = !ctrl.validateServiceCodeSurface(
          $scope.transaction
        );
      });

      ctrl.validateSelectedSurfaces = function (
        serviceTransaction,
        summarySurfaces
      ) {
        return surfaceHelper.validateSelectedSurfaces(
          serviceTransaction.Surface,
          summarySurfaces
        );
      };

      ctrl.validateServiceCodeSurface = function (serviceTransaction) {
        if (
          !_.isUndefined($scope.allTeeth) &&
          !_.isUndefined(serviceTransaction) &&
          _.isEqual(serviceTransaction.AffectedAreaId, 4)
        ) {
          var selectedTooth = serviceTransaction.Tooth;
          if (
            selectedTooth &&
            serviceTransaction.Surface &&
            serviceTransaction.Surface.length > 0
          ) {
            var tooth = listHelper.findItemByFieldValue(
              $scope.allTeeth,
              'USNumber',
              selectedTooth
            );
            if (tooth) {
              return ctrl.validateSelectedSurfaces(
                serviceTransaction,
                tooth.SummarySurfaceAbbreviations
              );
            }
          }
          return false;
        }
        return true;
      };

      //validate root
      $scope.validateRoot = function (serviceTransaction) {
        return ctrl.validateServiceCodeRoot(serviceTransaction);
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

      //validate tooth
      ctrl.validateServiceCodeTooth = function (serviceTransaction) {
        var isValid = true;
        if ($scope.allTeeth) {
          if (
            serviceTransaction.AffectedAreaId == 1 ||
            serviceTransaction.UseCodeForRangeOfTeeth
          ) {
            isValid = true;
          } else if (serviceTransaction.AffectedAreaId != 2) {
            var tooth = listHelper.findItemByFieldValue(
              $scope.allTeeth,
              'USNumber',
              serviceTransaction.Tooth
            );
            if (tooth) {
              isValid = true;
            } else {
              isValid = false;
            }
          }
          // don't validate the tooth unless it has changed
          var toothHasChanged =
            $scope.originalTransactionObject.Tooth !== $scope.transaction.Tooth;
          if (isValid && toothHasChanged) {
            isValid = ctrl.validateApplicableTooth();
          }
        }
        return isValid;
      };

      $scope.$watchGroup(
        [
          'transaction.Tooth',
          'transaction.AffectedAreaId',
          'transaction.UseCodeForRangeOfTeeth',
        ],
        function () {
          if (
            $scope.transaction.TransactionTypeId === 1 &&
            $scope.transaction.AffectedAreaId !== null &&
            $scope.transaction.AffectedAreaId !== undefined &&
            $scope.transaction.UseCodeForRangeOfTeeth !== null &&
            $scope.transaction.UseCodeForRangeOfTeeth !== undefined
          ) {
            $scope.validateTooth($scope.transaction);
          }
        }
      );

      $scope.validateTooth = function (serviceTransaction, isSurface) {
        if (serviceTransaction) {
          serviceTransaction.Tooth = serviceTransaction.Tooth
            ? serviceTransaction.Tooth.replace(/^0+/, '').toUpperCase()
            : serviceTransaction.Tooth;
          if (serviceTransaction.AffectedAreaId != 2) {
            serviceTransaction.Tooth =
              serviceTransaction.Tooth &&
              !serviceTransaction.UseCodeForRangeOfTeeth
                ? serviceTransaction.Tooth.replace(/[^A-T0-9]/gi, '')
                : serviceTransaction.Tooth;
          } else {
            serviceTransaction.Tooth = serviceTransaction.Tooth
              ? serviceTransaction.Tooth.replace(/[^UR|UL|LR|LL]/gi, '')
              : serviceTransaction.Tooth;
          }
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
        serviceTransaction.isSurfaceEditing = false;
        serviceTransaction.invalidTooth = !ctrl.validateServiceCodeTooth(
          serviceTransaction
        );
        serviceTransaction.invalidSurface = !ctrl.validateServiceCodeSurface(
          serviceTransaction
        );
        serviceTransaction.invalidRoot = !ctrl.validateServiceCodeRoot(
          serviceTransaction
        );
        return !serviceTransaction.invalidTooth;
      };

      ctrl.validateTransaction = function () {
        if ($scope.transaction.TransactionTypeId === 1) {
          $scope.transaction.invalidTooth = false;
          var isValidDate =
            $scope.transaction.DateEntered != '' &&
            angular.isDefined($scope.transaction.DateEntered) &&
            $scope.transaction.ValidDate &&
            $scope.transaction.DateEntered != undefined &&
            $scope.transaction.DateEntered != null;
          var isValidTooth =
            $scope.transaction.AffectedAreaId === 1 ||
            ($scope.transaction.Tooth > '' &&
              $scope.validateTooth($scope.transaction));
          var isValidSurface =
            $scope.transaction.AffectedAreaId != 4 ||
            ($scope.transaction.Surface > '' &&
              ctrl.validateServiceCodeSurface($scope.transaction));
          var isValidRoots =
            $scope.transaction.AffectedAreaId != 3 ||
            ($scope.transaction.Roots > '' &&
              ctrl.validateServiceCodeRoot($scope.transaction));
          var isValidProvider = $scope.transaction.ProviderUserId > '';
          var isValidFee = !(
            typeof $scope.transaction.Fee === 'undefined' ||
            $scope.transaction.Fee === null ||
            $scope.transaction.Fee < 0 ||
            $scope.transaction.Fee > 999999.99
          );
          var isValidTax = !(
            typeof $scope.transaction.Tax === 'undefined' ||
            $scope.transaction.Tax === null ||
            $scope.transaction.Tax < 0 ||
            $scope.transaction.Tax > 999999.99
          );
          var isValidTotalEstInsurance = _.lte(
            $scope.transaction.TotalEstInsurance,
            $scope.transaction.Amount
          );

          if (!isValidDate) {
            $timeout(function () {
              angular.element('#inpTransactionDate').find('input').focus();
            }, 0);
            return false;
          }
          if (!isValidProvider) {
            $timeout(function () {
              angular.element('#lstProvider').find('span').focus();
            }, 100);
            return false;
          }
          if (!isValidTooth) {
            $timeout(function () {
              $scope.transaction.invalidTooth = true;
              angular.element('#inpTooth').focus();
            }, 0);
            return false;
          }
          if (!isValidSurface) {
            $timeout(function () {
              $scope.transaction.invalidSurface = true;
              angular.element('#inpSurface').focus();
            }, 0);
            return false;
          }
          if (!isValidRoots) {
            $timeout(function () {
              $scope.transaction.invalidRoot = true;
              angular.element('#inpRoots').focus();
            }, 0);
            return false;
          }

          if (!isValidFee) {
            $timeout(function () {
              angular.element('#inpFee').focus();
            }, 0);
            return false;
          }
          if (!isValidTax) {
            $timeout(function () {
              angular.element('#inpTax').focus();
            }, 0);
            return false;
          }

          if (!isValidTotalEstInsurance) {
            $timeout(function () {
              angular.element('#inpInsEst').focus();
            }, 0);
            return false;
          }

          $scope.validateFlag = false;
          return true;
        } else if ($scope.transaction.TransactionTypeId === 5) {
          var isValidEnteredDate =
            $scope.transaction.DateEntered != '' &&
            angular.isDefined($scope.transaction.DateEntered) &&
            $scope.transaction.ValidDate &&
            $scope.transaction.ValidDate &&
            $scope.transaction.DateEntered != undefined &&
            $scope.transaction.DateEntered != null;
          var isValidAmount = !(
            typeof $scope.transaction.Amount === 'undefined' ||
            $scope.transaction.Amount === null ||
            $scope.transaction.Amount <= 0 ||
            $scope.transaction.Amount > 999999.99
          );
          var isValidAdjustmentType = $scope.transaction.AdjustmentTypeId > '';

          if (!isValidEnteredDate) {
            $timeout(function () {
              angular.element('#inpTransactionDate').find('input').focus();
            }, 0);
            return false;
          }
          if (!isValidAdjustmentType) {
            $timeout(function () {
              angular.element('#lstAdjustmentType').find('span').focus();
            }, 100);
            return false;
          }
          if (!isValidAmount) {
            $timeout(function () {
              angular.element('#inpAmount').focus();
            }, 0);
            return false;
          }

          $scope.validateFlag = false;
          return true;
        }
        return false;
      };

      //#region Save Transaction
      //Success callback to handle success response from server
      ctrl.updateTransactionSuccess = function (successResponse) {
        $scope.transaction = successResponse.Value;
        if ($scope.transaction.TransactionTypeId === 1) {
          toastrFactory.success(
            localize.getLocalizedString('{0} updated successfully', [
              'Service transaction',
            ]),
            localize.getLocalizedString('Success')
          );
        } else if ($scope.transaction.TransactionTypeId === 5) {
          toastrFactory.success(
            localize.getLocalizedString('{0} updated successfully', [
              'Debit transaction',
            ]),
            localize.getLocalizedString('Success')
          );
        }
        $scope.alreadySaving = false;
        $uibModalInstance.close();
      };
      //Error callback to handle error from server
      ctrl.updateTransactionFailure = function (errorResponse) {
        $scope.alreadySaving = false;
        ctrl.updateTransactionMessage = '';
        if ($scope.transaction.TransactionTypeId === 1) {
          ctrl.updateTransactionMessage = 'updating service transaction';
        } else if ($scope.transaction.TransactionTypeId === 5) {
          ctrl.updateTransactionMessage = 'updating debit transaction';
        }

        if (!(errorResponse && errorResponse.status === 409)) {
          toastrFactory.error(
            localize.getLocalizedString('An error has occurred while {0}', [
              ctrl.updateTransactionMessage,
            ]),
            localize.getLocalizedString('Error')
          );
        }
      };

      $scope.overrideEstimatedInsurance = function (serviceTransaction) {
        if (!_.isNull(serviceTransaction)) {
          let primaryInsuranceEstimateIndex = -1;
          _.forEach(
            serviceTransaction.InsuranceEstimates,
            function (insuranceEstimate, index) {
              insuranceEstimate.ObjectState = saveStates.Update;
              insuranceEstimate.EstInsurance = 0;
              insuranceEstimate.IsUserOverRidden = true;
              insuranceEstimate.IsMostRecentOverride = false;

              if (
                serviceTransaction.OpenClaim &&
                serviceTransaction.OpenClaim.PatientBenefitPlanId ===
                  insuranceEstimate.PatientBenefitPlanId
              ) {
                primaryInsuranceEstimateIndex = index;
              }
            }
          );

          // TODO: if encounter is pending (status of 2) or if encounter has open claims (currently this code is only called from active encounters)
          if (primaryInsuranceEstimateIndex >= 0) {
            serviceTransaction.InsuranceEstimates[
              primaryInsuranceEstimateIndex
            ].EstInsurance = serviceTransaction.TotalEstInsurance;
            serviceTransaction.InsuranceEstimates[
              primaryInsuranceEstimateIndex
            ].IsUserOverRidden = true;
            serviceTransaction.InsuranceEstimates[
              primaryInsuranceEstimateIndex
            ].IsMostRecentOverride = true;

            financialService
              .RecalculateInsurance([serviceTransaction])
              .then(function () {
                var fee = serviceTransaction.Fee ? serviceTransaction.Fee : 0;
                var discount = serviceTransaction.Discount
                  ? serviceTransaction.Discount
                  : 0;
                var tax = serviceTransaction.Tax ? serviceTransaction.Tax : 0;
                var paidInsAmount = serviceTransaction.TotalInsurancePaidAmount
                  ? serviceTransaction.TotalInsurancePaidAmount
                  : 0;
                var estInsurance = serviceTransaction.TotalEstInsurance
                  ? serviceTransaction.TotalEstInsurance
                  : 0;
                var correctionAmount = 0;

                if (paidInsAmount > estInsurance) {
                  correctionAmount = estInsurance;
                } else {
                  correctionAmount = paidInsAmount;
                }

                serviceTransaction.Amount = parseFloat(
                  fee - discount + tax
                ).toFixed(2);
                serviceTransaction.$PatientPortion = parseFloat(
                  fee - discount + tax - estInsurance
                ).toFixed(2);

                if (serviceTransaction.Amount && serviceTransaction.Balance) {
                  var alreadyPaidAmount = serviceTransaction.AlreadyPaidAmount;

                  serviceTransaction.Balance = parseFloat(
                    fee -
                      discount +
                      tax +
                      alreadyPaidAmount -
                      estInsurance +
                      correctionAmount
                  ).toFixed(2);
                  serviceTransaction.$PatientPortion = parseFloat(
                    serviceTransaction.Balance
                  ).toFixed(2);
                }

                if (
                  serviceTransaction.InsuranceEstimates &&
                  estInsurance == 0
                ) {
                  serviceTransaction.TotalEstInsurance = '';
                }
              });
          } else {
            serviceTransaction.TotalEstInsurance = 0;
          }
        }
      };

      ctrl.setToothInfo = function () {
        // Initialize teeth variables to override disable if transaction has no tooth.
        $scope.activeTeeth = [];
        $scope.originalActiveTeeth = [];
        if ($scope.transaction.Tooth) {
          $scope.activeTeeth.push($scope.transaction.Tooth);
          $scope.originalActiveTeeth = _.clone($scope.activeTeeth);
          $scope.originalActiveTeeth = $scope.originalActiveTeeth[0].split(',');
        }
      };

      ctrl.setToothInfo();

      $scope.saveTransaction = function () {
        // only reset Tooth it is an array and UseCodeForRangeOfTeeth equals true and array has changed
        if (
          $scope.transaction.UseCodeForRangeOfTeeth &&
          _.isArray($scope.activeTeeth)
        ) {
          if (
            !$filter('teethEqual')(
              $scope.activeTeeth,
              $scope.originalActiveTeeth
            )
          ) {
            $scope.transaction.Tooth = $scope.activeTeeth.join(',');
          }
        }

        $scope.isSaveButtonclicked = true;
        if (ctrl.validateTransaction()) {
          if (ctrl.transactionHasClaimThatNeedsToRecreate($scope.transaction)) {
            ctrl.handleClaim();
          } else {
            ctrl.handleAffectedCredits();
          }
        } else {
          $scope.validateFlag = true;
        }
      };

      ctrl.handleClaim = function () {
        patientServices.Claim.getServiceTransactionsByClaimId({
          claimId: $scope.transaction.OpenClaim.ClaimId,
          includeServiceData: true,
        }).$promise.then(function (claimResult) {
          var code = _.find(dataForModal.ServiceCodes, {
            ServiceCodeId: $scope.transaction.ServiceCodeId,
          });
          modalFactory
            .ServiceTransactionCrudCloseClaimModal({
              isEdit: true,
              serviceCode: code.Code,
              planPriority:
                $scope.transaction.OpenClaim.PatientBenefitPlanPriority,
              willAffectFeeScheduleWriteOff: ctrl.willAffectFeeSchedules(),
              willAffectOtherPayment:
                $scope.transaction.HasNonWriteoffNonInsurancePaymentCredit,
              otherClaimServices: _.chain(claimResult.Value)
                .map('ServiceTransaction')
                .reject({
                  ServiceTransactionId: $scope.transaction.ServiceTransactionId,
                })
                .value(),
            })
            .then(function (modalResult) {
              var closeClaimDto = {
                ClaimId: $scope.transaction.OpenClaim.ClaimId,
                NoInsurancePayment: false,
                IsEdited: true,
                UpdateServiceTransactions: true,
                Note: modalResult.note,
                DataTag: $scope.transaction.OpenClaim.DataTag,
              };
              closeClaimService
                .update({ checkDataTag: true }, closeClaimDto)
                .$promise.then(
                  function () {
                    toastrFactory.success(
                      localize.getLocalizedString('{0} closed successfully.', [
                        'Claim',
                      ]),
                      'Success'
                    );
                    var promises = [
                      patientServices.Encounter.getAllEncountersByEncounterId({
                        encounterId: $scope.transaction.EncounterId,
                      }).$promise,
                    ];
                    if (!modalResult.recreate) {
                      promises.push(
                        patientServices.PatientBenefitPlan.getBenefitPlansAvailableByClaimId(
                          [$scope.transaction.OpenClaim.ClaimId]
                        ).$promise
                      );
                    }
                    $q.all(promises).then(function (results) {
                      $scope.transaction.Amount = parseFloat(
                        (
                          $scope.transaction.Fee -
                          $scope.transaction.Discount +
                          $scope.transaction.Tax
                        ).toFixed(2)
                      );
                      $scope.transaction.ObjectState = saveStates.Update;
                      var fresh = _.find(
                        results[0].Value.ServiceTransactionDtos,
                        {
                          ServiceTransactionId:
                            $scope.transaction.ServiceTransactionId,
                        }
                      );
                      $scope.transaction.DataTag = fresh.DataTag;
                      _.each(
                        $scope.transaction.InsuranceEstimates,
                        function (insEst) {
                          var newEst = _.find(fresh.InsuranceEstimates, {
                            EstimatedInsuranceId: insEst.EstimatedInsuranceId,
                          });
                          insEst.DataTag = newEst.DataTag;
                          // Clear est ins if not recreating after claim closes
                          if (
                            !_.isEqual(insEst.ObjectState, saveStates.Update) ||
                            !modalResult.recreate
                          ) {
                            insEst.EstInsurance = 0;
                            insEst.AdjEst = 0;
                          }
                        }
                      );
                      ctrl.updateTransaction(
                        modalResult.recreate,
                        $scope.transaction.OpenClaim,
                        results[1]
                      );
                    });
                  },
                  function (error) {
                    if (!(error && error.status === 409)) {
                      toastrFactory.error(
                        localize.getLocalizedString(
                          'Failed to close {0}. Please try again.',
                          ['Claim']
                        ),
                        'Error'
                      );
                    }
                  }
                );
            });
        });
      };

      ctrl.updateTransaction = function (recreate, claim, otherPlans) {
        patientServices.ServiceTransactions.update(
          { accountMemberId: $scope.transaction.AccountMemberId },
          [$scope.transaction]
        ).$promise.then(function () {
          toastrFactory.success(
            localize.getLocalizedString('{0} updated successfully', [
              'Service transaction',
            ]),
            localize.getLocalizedString('Success')
          );
          if (recreate) {
            patientServices.Claim.recreateMultipleClaims([
              claim.ClaimId,
            ]).$promise.then(
              function () {
                toastrFactory.success(
                  { Text: '{0} re-created successfully.', Params: ['Claim'] },
                  'Success'
                );
                $uibModalInstance.close();
              },
              function () {
                toastrFactory.error(
                  { Text: 'Failed to re-create {0}.', Params: ['Claim'] },
                  'Error'
                );
                $uibModalInstance.close();
              }
            );
          } else {
            ctrl.AskuserAboutCreatingMoreClaims(claim, otherPlans);
          }
        });
      };

      ctrl.handleAffectedCredits = function () {
        if (ctrl.willAffectFeeSchedules()) {
          modalFactory
            .ConfirmModal(
              localize.getLocalizedString('Edit Service'),
              localize.getLocalizedString(
                'The service you are modifying has a fee schedule adjustment associated with it.\xa0\xa0The adjustment will be modified to match the changes to the service.'
              ),
              localize.getLocalizedString('OK'),
              localize.getLocalizedString('Cancel')
            )
            .then(ctrl.confirmEdit);
        } else {
          ctrl.confirmEdit();
        }
      };

      ctrl.confirmEdit = function () {
        if (
          ($scope.feeChanged && $scope.transaction.isPaymentApplied) ||
          $scope.transaction.HasNonWriteoffNonInsurancePaymentCredit
        ) {
          modalFactory
            .ConfirmModal(
              localize.getLocalizedString('Edit'),
              //type 1 for service, 5 or 6 for debit
              localize.getLocalizedString(
                `This transaction has a payment or negative adjustment applied to it, changing the ${
                  $scope.transaction.TransactionTypeId === 1 ? 'fee' : 'amount'
                } could result in an unapplied amount.`
              ),
              localize.getLocalizedString('Continue'),
              localize.getLocalizedString('Cancel')
            )
            .then(ctrl.continueWithEdit);
        } else {
          ctrl.continueWithEdit();
        }
      };

      ctrl.transactionHasClaimThatNeedsToRecreate = function (transaction) {
        return (
          transaction.OpenClaim &&
          (ctrl.transactionInitialCopy.DateEntered !==
            transaction.DateEntered ||
            ctrl.transactionInitialCopy.ProviderUserId !==
              transaction.ProviderUserId ||
            ctrl.transactionInitialCopy.ProviderOnClaimsId !==
              transaction.ProviderOnClaimsId ||
            ctrl.transactionInitialCopy.Fee !== transaction.Fee ||
            ctrl.transactionInitialCopy.Tax !== transaction.Tax ||
            !surfaceHelper.areSurfaceCSVsEqual(
              ctrl.transactionInitialCopy.Surface,
              transaction.Surface
            ) ||
            ctrl.transactionInitialCopy.Tooth !== transaction.Tooth ||
            ctrl.transactionInitialCopy.Roots !== transaction.Roots)
        );
      };
      //#endregion

      ctrl.continueWithEdit = function () {
        if (ctrl.hasViewOrEditAccessTransaction) {
          if (!$scope.alreadySaving) {
            $scope.alreadySaving = true;
            var transactions = [];
            if ($scope.transaction.TransactionTypeId === 1) {
              $scope.transaction.invalidTooth = false;
              $scope.transaction.invalidSurface = false;
            }
            $scope.transaction.ObjectState = saveStates.Update;
            if (!$scope.transaction.isPaymentApplied) {
              // if payment is not applied on service-transaction or positive adjustment then copy Amount to Balance
              $scope.transaction.Balance = $scope.transaction.Amount;
            } else if (!_.isUndefined($scope.transaction.RemainingBalance)) {
              $scope.transaction.Balance = $scope.transaction.RemainingBalance;
            }

            transactions.push($scope.transaction);
            if ($scope.transaction.TransactionTypeId === 1) {
              patientServices.ServiceTransactions.update(
                {
                  accountMemberId: $scope.transaction.AccountMemberId,
                  processMaxUsed: true,
                },
                transactions,
                ctrl.updateTransactionSuccess,
                ctrl.updateTransactionFailure
              );
            } else if ($scope.transaction.TransactionTypeId === 5) {
              patientServices.DebitTransaction.update(
                transactions,
                ctrl.updateTransactionSuccess,
                ctrl.updateTransactionFailure
              );
            }
          }
        } else {
          ctrl.notifyNotAuthorized($scope.soarAuthEditKey);
        }
        $scope.isSaveButtonclicked = false;
      };
      //#endregion
      ctrl.continueWithCancel = function () {
        $scope.transaction = angular.copy(ctrl.transactionInitialCopy);
      };

      //#region  make editable transaction
      $scope.editTransaction = function () {
        $scope.checkServiceLocation();

        var serviceLocationId = $scope.transaction.LocationId;
        if (serviceLocationId) {
          patientValidationFactory
            .userLocationAuthorization(serviceLocationId)
            .then(function (result) {
              var userLocationInfo = result;
              if (
                !userLocationInfo.authorization
                  .UserIsAuthorizedToAtLeastOnePatientLocation
              ) {
                patientValidationFactory.LaunchUserLocationErrorModal(
                  userLocationInfo,
                  'edit'
                );
                return;
              } else {
                if (!$scope.editMode && ctrl.currentTransactionTypeId === 1) {
                  ctrl.checkForInsurancePayment($scope.transaction);
                } else {
                  ctrl.continueEdit();
                }
              }
              patientValidationFactory.SetCheckingUserPatientAuthorization(
                false
              );
            });
        } else if (!patientValidationFactory.CheckingUserPatientAuthorization) {
          return false;
        }
      };

      ctrl.continueEdit = function () {
        $scope.editMode = !$scope.editMode;
        // Take backup of transaction to track changes on it.
        ctrl.transactionInitialCopy2 = angular.copy($scope.transaction);
        //force adjustment type dropdown to populate
        $scope.transaction.AdjustmentTypeId = null;

        $timeout(function () {
          $timeout(function () {
            $scope.transaction.AdjustmentTypeId =
              ctrl.transactionInitialCopy2.AdjustmentTypeId;
          });
        });

        ctrl.filterOutAdjustmentTypes(
          $scope.transaction.AdjustmentTypeId,
          ctrl.filterTypes.Inactive
        );

        ctrl.defaultFocus();
      };

      ctrl.checkForInsurancePayment = function (transaction) {
        patientServices.ServiceTransactions.checkForInsurancePayment({
          serviceTransactionId: transaction.ServiceTransactionId,
        }).$promise.then(function (result) {
          if (result.Value) {
            ctrl.invalidEditModal();
          } else {
            ctrl.continueEdit();
          }
        });
      };

      ctrl.invalidEditModal = function () {
        var title = localize.getLocalizedString('Invalid Action');
        var message = localize.getLocalizedString(
          "You can't {0} a Service Transaction that has an Insurance Payment Applied to it.",
          ['Edit']
        );
        var button1Text = localize.getLocalizedString('OK');
        modalFactory.ConfirmModal(title, message, button1Text);
      };
      //#endregion

      // Function to handle navigation to account summary for selected encounter(s)
      $scope.navigateToAccountSummary = function (encounterId) {
        let patientPath = '#/Patient/';
        tabLauncher.launchNewTab(
          patientPath +
            $scope.patientInfo.PersonAccount.PersonId +
            '/Summary?tab=Account Summary&open=new&encounterId=' +
            encounterId
        );
      };

      // Function to handle cancel button click event
      $scope.closeModal = function () {
        ctrl.checkForDataChange($uibModalInstance.dismiss);
      };

      // check for whether data has changed or not, if yes display confirmation message
      ctrl.checkForDataChange = function (func) {
        if ($scope.editMode) {
          ctrl.dataHasChanged = ctrl.transactionHasChanged(
            $scope.transaction,
            ctrl.transactionInitialCopy
          );
          //Display cancel modal depending upon whether data has changed or not
          if (ctrl.dataHasChanged) modalFactory.CancelModal().then(func);
          else func();
        } else {
          func();
        }
      };

      // Function to calculate tax on fee change
      $scope.calculateTaxandInsurance = function () {
        $scope.taxLoading = true;
        if ($scope.previousAmountChanged == true) {
          $scope.taxLoading = true;
          if (
            $scope.transaction.Fee == null ||
            $scope.transaction.Fee == undefined ||
            $scope.transaction.Fee == 0
          ) {
            $scope.transaction.Fee = 0;
            $scope.transaction.Tax = 0;
            $scope.transaction.Amount = parseFloat(
              ($scope.transaction.Fee + $scope.transaction.Tax).toFixed(2)
            );
            $scope.previousAmountChanged = false;
            $scope.taxLoading = false;
          } else {
            var serviceCode = _.find(dataForModal.ServiceCodes, {
              ServiceCodeId: $scope.transaction.ServiceCodeId,
            });

            if (!_.isNull(serviceCode)) {
              $scope.transaction.DiscountableServiceTypeId =
                serviceCode.DiscountableServiceTypeId;
              $scope.transaction.TaxableServiceTypeId =
                serviceCode.$$locationTaxableServiceTypeId;
            }

            patientServicesFactory
              .GetTaxAndDiscount([$scope.transaction])
              .then(function (result) {
                if (result && result.Value && result.Value[0]) {
                  var resultTransaction = result.Value[0];

                  $scope.transaction.Discount = resultTransaction.Discount;
                  $scope.transaction.Tax = resultTransaction.Tax;
                  $scope.transaction.Amount = parseFloat(
                    (
                      $scope.transaction.Fee -
                      $scope.transaction.Discount +
                      $scope.transaction.Tax
                    ).toFixed(2)
                  );

                  if ($scope.transaction.OpenClaim) {
                    financialService
                      .RecalculateInsurance([$scope.transaction])
                      .then(function () {
                        $scope.previousAmountChanged = false;
                        $scope.taxLoading = false;
                      });
                  } else {
                    $scope.previousAmountChanged = false;
                    $scope.taxLoading = false;
                  }
                } else {
                  $scope.transaction.Discount = 0;
                  $scope.transaction.Tax = 0;
                  $scope.transaction.Amount = parseFloat(
                    (
                      $scope.transaction.Fee -
                      $scope.transaction.Discount +
                      $scope.transaction.Tax
                    ).toFixed(2)
                  );

                  $scope.previousAmountChanged = false;
                  $scope.taxLoading = false;

                  toastrFactory.error(
                    localize.getLocalizedString(
                      'Failed to calculate tax and discount'
                    ),
                    localize.getLocalizedString('Server Error')
                  );
                }
              });
          }
        } else {
          $scope.previousAmountChanged = false;
          $scope.taxLoading = false;
        }
      };

      // Set flag to identify if fee is updated
      $scope.setPreviousAmount = function () {
        $scope.previousAmountChanged =
          $scope.transaction.TransactionTypeId === 1 ? true : false;
        $scope.feeChanged = true;
      };

      ctrl.willAffectFeeSchedules = function () {
        return (
          ($scope.transaction.hasCheckoutFeeScheduleWriteOff &&
            $scope.transaction.DateEntered !=
              $scope.originalTransactionObject.DateEntered) ||
          ($scope.transaction.hasFeeScheduleWriteOff &&
            $scope.transaction.ProviderUserId !=
              $scope.originalTransactionObject.ProviderUserId)
        );
      };

      ctrl.AskuserAboutCreatingMoreClaims = function (claimInfo, otherPlans) {
        if (
          claimInfo &&
          _.some(ctrl.plans, function (plan) {
            return (
              plan.PatientBenefitPlanDto.PatientBenefitPlanId ===
                claimInfo.PatientBenefitPlanId &&
              plan.PatientBenefitPlanDto.Priority ===
                claimInfo.PatientBenefitPlanPriority
            );
          }) &&
          otherPlans != null &&
          otherPlans.Value.PatientBenefitPlans.length > 0
        ) {
          modalFactory.CloseClaimCancelModal(otherPlans).then(
            function (modalRes) {
              ctrl.getCreatedClaim(modalRes);
              ctrl.replacementPBPIds = modalRes.pbpIds;
              $uibModalInstance.close();
            },
            function () {
              $uibModalInstance.close();
            }
          );
        } else {
          $uibModalInstance.close();
        }
      };

      ctrl.getCreatedClaim = function (claim) {
        claimsService.getClaimById(
          {
            claimId: claim.claims[0].ClaimId,
          },
          ctrl.getClaimSuccess(claim),
          ctrl.getClaimFailure
        );
      };

      ctrl.getClaimFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString('Failed to get new claim.'),
          'Failure'
        );
      };

      ctrl.getClaimSuccess = function (oldClaimData) {
        return function (response) {
          var newClaim = response.Value;
          var selectedClaimHasAdjustedEstimate = false;

          angular.forEach(
            newClaim.ServiceTransactionToClaimPaymentDtos,
            function (serviceTransaction) {
              if (serviceTransaction.AdjustedEstimate > 0) {
                selectedClaimHasAdjustedEstimate = true;
              }
            }
          );

          var selectedPlanAdjustsOff =
            oldClaimData.selectedPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
              .FeesIns === 2;
          var selectedPlanApplyAtCharge =
            oldClaimData.selectedPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
              .ApplyAdjustments === 1;

          if (
            oldClaimData.selectedPlan.Priority === 1 &&
            selectedPlanAdjustsOff &&
            selectedPlanApplyAtCharge &&
            selectedClaimHasAdjustedEstimate
          ) {
            ctrl.handleAdjustmentModal(newClaim);
          } else {
            //send to code flow endpoint
          }
        };
      };

      //handle confirmation modal for handling fee schedule adjustments
      ctrl.handleAdjustmentModal = function (claim) {
        var title = localize.getLocalizedString('Fee Schedule Present');
        var message = localize.getLocalizedString(
          "The patient's benefit plan requires a fee schedule adjustment. Would you like to complete the adjustment now?"
        );
        var button1Text = localize.getLocalizedString('Yes');
        var button2Text = localize.getLocalizedString('No');
        modalFactory
          .ConfirmModal(title, message, button1Text, button2Text)
          .then(ctrl.openAdjustmentModal(claim), ctrl.closeModals());
      };
      // set the tooltip based on whether the current location matches the service transaction location
      $scope.checkServiceLocation = function () {
        if (
          $scope.originalTransactionObject &&
          $scope.originalTransactionObject.LocationId
        ) {
          var currentLocation = locationService.getCurrentLocation();
          if (
            currentLocation.id === $scope.originalTransactionObject.LocationId
          ) {
            // ok to edit
            $scope.serviceLocationMatch = true;
            $scope.saveTooltip = localize.getLocalizedString('Save');
          } else {
            // not ok to edit
            $scope.serviceLocationMatch = false;
            $scope.saveTooltip = localize.getLocalizedString(
              "Your current location does not match this service transaction's location."
            );
          }
        }
      };
      ctrl.closeModals = function () {
        return function () {
          //send to code flow endpoint
        };
      };

      //#region // added to support validating teeth modifications Bug 351784

      // we will need CdtCodeGroups to support validating teeth selection

      staticData.CdtCodeGroups().then(function (res) {
        $scope.cdtCodegroups = res.Value;
      });

      // get applicable teeth from the teethDefinitions based on smart code group
      ctrl.getApplicableTeeth = function (cdtCodegroups) {
        // default applicableTeeth to allTeeth, only change if cdtCodeGroup.AllowedTeeth isn't All
        $scope.allApplicableTeeth = angular.copy($scope.allTeeth);
        if (cdtCodegroups[0].AllowedTeeth.indexOf('All') == -1) {
          $scope.allApplicableTeeth = [];
          angular.forEach(cdtCodegroups, function (cdtCodegroup) {
            angular.forEach(cdtCodegroup.AllowedTeeth, function (tooth) {
              if (
                listHelper.findItemByFieldValue(
                  $scope.allApplicableTeeth,
                  'USNumber',
                  tooth
                ) === null
              ) {
                var toothObj = listHelper.findItemByFieldValue(
                  $scope.allTeeth,
                  'USNumber',
                  tooth
                );

                if (toothObj) {
                  $scope.allApplicableTeeth.push(toothObj);
                }
              }
            });
          });
        }
      };

      // validate that tooth is an applicableTooth
      ctrl.validateApplicableTooth = function () {
        var isValid = true;
        // we can't validate a range of teeth and this module doesn't allow edit of tooth when UseCodeForRangeOfTeeth
        if (
          $scope.transaction.Tooth &&
          $scope.transaction.UseCodeForRangeOfTeeth === false
        ) {
          ctrl.loadApplicableTeethForCode();
          var found = listHelper.findItemByFieldValue(
            $scope.allApplicableTeeth,
            'USNumber',
            $scope.transaction.Tooth
          );
          if (!found) {
            isValid = false;
          }
        }
        return isValid;
      };

      // create applicable tooth list based on cdtCodeGroup
      ctrl.loadApplicableTeethForCode = function () {
        if ($scope.transaction) {
          var cdtCodeGroup = listHelper.findAllByPredicate(
            $scope.cdtCodegroups,
            function (item) {
              return item.CdtCode === $scope.transaction.CdtCodeName;
            }
          );
          // if cdtCodeGroup exists use this to determine applicable teeth
          if (cdtCodeGroup && cdtCodeGroup.length > 0) {
            ctrl.getApplicableTeeth(cdtCodeGroup);
          } else {
            // otherwise applicableTeeth is allTeeth
            $scope.allApplicableTeeth = angular.copy($scope.allTeeth);
          }
        }
      };

      //#endregion

      ctrl.openAdjustmentModal = function (claim) {
        return function () {
          var ids = _.map(
            claim.ServiceTransactionToClaimPaymentDtos,
            function (item) {
              return item.ServiceTransactionId;
            }
          );
          var sum = _.reduce(
            claim.ServiceTransactionToClaimPaymentDtos,
            function (sum, item) {
              return sum + item.AdjustedEstimate;
            },
            0
          );

          ctrl.dataForModal = {
            PatientAccountDetails: { AccountId: claim.AccountId },
            DefaultSelectedIndex: 1,
            AllProviders: ctrl.providers,
            BenefitPlanId: claim.BenefitPlanId,
            claimAmount: 0,
            isFeeScheduleAdjustment: true,
            claimId: claim.ClaimId,
            serviceTransactionData: {
              serviceTransactions: ids,
              isForCloseClaim: true,
              unPaidAmout: sum,
            },
            patientData: {
              patientId: claim.PatientId,
              patientName: claim.PatientName,
            },
          };
          modalDataFactory
            .GetTransactionModalData(ctrl.dataForModal, claim.PatientId)
            .then(function (result) {
              modalFactory.TransactionModal(
                result,
                //send to code flow endpoint
                ctrl.closeModals(),
                ctrl.closeModals()
              );
            });
        };
      };
      $scope.updateProviderId = function (providerId) {
        $scope.transaction.ProviderUserId = providerId;
        $scope.$apply();
      };
    },
  ])
  .filter('teethEqual', function () {
    return function (active, original) {
      return _.isEqual(active, original);
    };
  });
