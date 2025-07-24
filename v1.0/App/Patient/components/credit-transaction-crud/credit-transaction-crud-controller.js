'use strict';
angular.module('Soar.Patient').controller('CreditTransactionCrudController', [
  '$scope',
  'localize',
  'ListHelper',
  'ModalFactory',
  'PatientServices',
  '$filter',
  'toastrFactory',
  'DataForModal',
  '$uibModalInstance',
  '$timeout',
  'SaveStates',
  'patSecurityService',
  '$location',
  'tabLauncher',
  'ClaimsService',
  'BusinessCenterServices',
  '$window',
  'userSettingsDataService',
  'TimeZoneFactory',
  'referenceDataService',
  /**
   *
   * @param {*} $scope
   * @param {*} localize
   * @param {*} listHelper
   * @param {*} modalFactory
   * @param {*} patientServices
   * @param {angular.IFilterService} $filter
   * @param {*} toastrFactory
   * @param {*} dataForModal
   * @param {*} $uibModalInstance
   * @param {angular.ITimeoutService} $timeout
   * @param {*} saveStates
   * @param {*} patSecurityService
   * @param {angular.ILocationService} $location
   * @param {*} tabLauncher
   * @param {*} claimsService
   * @param {*} businessCenterServices
   * @param {angular.IWindowService} $window
   * @param {*} userSettingsDataService
   * @param {*} timeZoneFactory
   * @param {{ getData: (entity: string) => angular.IPromise<any>; entityNames: Record<string, string>; }} referenceDataService
   */
  function (
    $scope,
    localize,
    listHelper,
    modalFactory,
    patientServices,
    $filter,
    toastrFactory,
    dataForModal,
    $uibModalInstance,
    $timeout,
    saveStates,
    patSecurityService,
    $location,
    tabLauncher,
    claimsService,
    businessCenterServices,
    $window,
    userSettingsDataService,
    timeZoneFactory,
    referenceDataService
  ) {
    //#region Member Variables
    var ctrl = this;
    ctrl.businessCenterServices = businessCenterServices;
    $scope.validateFlag = false;
    $scope.alreadySaving = false;
    $scope.taxLoading = false;
    $scope.previousAmountChanged = false;
    $scope.isSaveButtonclicked = false;

    $scope.editMode = dataForModal.EditMode;
    // Operate on all provider list and build object of required providers
    $scope.providers = [];
    $scope.patientInfo = dataForModal.Patient;
    $scope.unassignedTransactions = dataForModal.UnassignedTransactions;
    ctrl.allAdjustmentTypes =
      dataForModal.AdjustmentTypes.length > 0
        ? $filter('getPositiveAdjustmentTypes')(
            angular.copy(dataForModal.AdjustmentTypes),
            false
          )
        : [];
    $scope.adjustmentTypes =
      ctrl.allAdjustmentTypes.length > 0
        ? _.filter(ctrl.allAdjustmentTypes, 'IsActive')
        : [];
    $scope.TransactionType = dataForModal.Transaction.TransactionTypeId;
    $scope.encounters = dataForModal.Encounters;
    $scope.debitTransactions = dataForModal.DebitTransaction;

    ctrl.now = moment();

    $scope.soarAuthEditKey = 'soar-acct-aapmt-edit';
    $scope.soarAuthViewKey = 'soar-acct-aapmt-view';
    $scope.soartAuthCdtEditKey = 'soar-acct-cdtadj-edit';
    $scope.soartAuthCdtViewKey = 'soar-acct-cdtadj-view';

    //#endregion

    // filter and sort paymentTypes
    ctrl.loadPaymentTypes = function (paymentTypes) {
      // filter and sort payment types
      if (paymentTypes) {
        let accountPaymentTypes = paymentTypes.filter(function (paymentType) {
          return (
            paymentType.PaymentTypeCategory === 1 &&
            paymentType.Description.toLowerCase().indexOf('vendor payment') ===
              -1
          );
        });
        accountPaymentTypes.sort((a, b) =>
          a.Description < b.Description ? -1 : 1
        );
        return accountPaymentTypes;
      }
      return [];
    };
    $scope.paymentTypes = ctrl.loadPaymentTypes(dataForModal.PaymentTypes);

    //#region Authorization

    // Check if logged in user has view access to this page
    ctrl.authViewAccess = function () {
      var authCdtAdjViewAccess =
        $scope.TransactionType != 4
          ? patSecurityService.IsAuthorizedByAbbreviation(
              $scope.soarAuthViewKey
            )
          : patSecurityService.IsAuthorizedByAbbreviation(
              $scope.soartAuthCdtViewKey
            );
      return authCdtAdjViewAccess;
    };

    // Check if logged in user has edit access to this page
    ctrl.authEditAccess = function () {
      var authCdtAdjEditAccess =
        $scope.TransactionType != 4
          ? patSecurityService.IsAuthorizedByAbbreviation(
              $scope.soarAuthEditKey
            )
          : patSecurityService.IsAuthorizedByAbbreviation(
              $scope.soartAuthCdtEditKey
            );
      return authCdtAdjEditAccess;
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
        ctrl.hasViewOrEditAccessToServiceTransaction = ctrl.authEditAccess();
      } else {
        ctrl.hasViewOrEditAccessToServiceTransaction = ctrl.authViewAccess();
      }

      if (!ctrl.hasViewOrEditAccessToServiceTransaction) {
        if ($scope.TransactionType == 2)
          ctrl.notifyNotAuthorized(
            $scope.editMode ? $scope.soarAuthEditKey : $scope.soarAuthViewKey
          );
        else
          ctrl.notifyNotAuthorized(
            $scope.editMode
              ? $scope.soartAuthCdtEditKey
              : $scope.soartAuthCdtViewKey
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
        $scope.providers,
        'UserId',
        enteredByUserId
      );
      if (provider != null) {
        name = provider.Name;
      }
      return name;
    };

    // Filter providers with provider types - Dentist, Hygienist, Assistant & Other
    ctrl.filteredProviders = function () {
      angular.forEach(dataForModal.Providers, function (provider) {
        if (
          provider.ProviderTypeId &&
          (provider.ProviderTypeId === 1 ||
            provider.ProviderTypeId === 2 ||
            provider.ProviderTypeId === 3 ||
            provider.ProviderTypeId === 5)
        ) {
          var name = provider.FirstName;
          if (provider.LastName > '') {
            name += ' ' + provider.LastName;
          }
          if (provider.ProfessionalDesignation > '') {
            name += ', ' + provider.ProfessionalDesignation;
          }
          $scope.providers.push({
            Name: name,
            FirstName: provider.FirstName,
            LastName: provider.LastName,
            UserId: provider.UserId,
            ProviderTypeId: provider.ProviderTypeId,
            IsActive: provider.IsActive,
            ProfessionalDesignation: provider.ProfessionalDesignation,
          });
        }
      });
      $scope.providers = $filter('orderBy')($scope.providers, 'Name');
    };
    // Initialize filtered providers
    ctrl.filteredProviders();
    //#endregion

    // Change event handler for payment type input field
    $scope.paymentTypeOnChange = function (paymentTypeId) {
      $scope.transaction.PaymentTypeId = paymentTypeId;

      // Find item by its display text as find by id will not provide proper results if user inputs guid ids.
      var item = listHelper.findItemByFieldValue(
        $scope.paymentTypes,
        'PaymentTypeId',
        $scope.transaction.PaymentTypeId
      );
      if (item == null) {
        // Clear the display value in combo-box and its corresponding id
        $scope.transaction.PaymentTypePromptValue = null;
        $scope.transaction.PromptTitle = '';
      } else {
        $scope.transaction.PaymentTypePromptValue = null;
        $scope.transaction.PromptTitle = item.Prompt ? item.Prompt : '';
      }
    };

    ctrl.getPaymentType = function (paymentTypeId) {
      var paymentType = listHelper.findItemByFieldValue(
        dataForModal.PaymentTypes,
        'PaymentTypeId',
        paymentTypeId
      );
      if (paymentType) {
        return paymentType.Description;
      } else {
        return '';
      }
    };

    ctrl.addInactiveAdjustmentTypeToDropDown = function () {
      if (dataForModal.Transaction.TransactionTypeId === 4) {
        if (
          !_.some($scope.adjustmentTypes, [
            'AdjustmentTypeId',
            dataForModal.Transaction.AdjustmentTypeId,
          ]) &&
          ctrl.allAdjustmentTypes.length > 0
        ) {
          $scope.adjustmentTypes.push(
            _.find(ctrl.allAdjustmentTypes, {
              AdjustmentTypeId: dataForModal.Transaction.AdjustmentTypeId,
            })
          );
          $scope.adjustmentTypes = _.orderBy(
            $scope.adjustmentTypes,
            'Description',
            'asc'
          );
        }
      }
    };

    // DateEntered manipulation required by bug 433188
    ctrl.setDateEntered = function (transactionDto, displayDate) {
      // if $$DateEntered has changed we need to update it here, currently DateEntered can only be today or in the past
      var start = moment(displayDate);
      var end = moment(transactionDto.$$DateEntered);
      var days = end.diff(start, 'days');
      if (days !== 0) {
        var currentDate = new Date(Date.parse(transactionDto.DateEntered));
        currentDate = moment(currentDate).add(days, 'days');
        transactionDto.DateEntered = currentDate;
      }
    };

    /**
     * Returns the location's timezone.
     *
     * @returns {angular.IPromise<string>} Location's timezone
     */
    ctrl.getLocationTimezone = function () {
      return referenceDataService
        .getData(referenceDataService.entityNames.locations)
        .then(function (locations) {
          //Getting the list of locations then filtering for the currently logged in location
          var userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
          var userLocationId = parseInt(userLocation.id);
          var ofcLocation = locations.find(
            location => location.LocationId === userLocationId
          );
          var locationTimezone = ofcLocation ? ofcLocation.Timezone : '';
          return locationTimezone;
        });
    };

    //#region Initialize Selected Transaction
    /**
     * Function to set properties for display on modal and create transaction backup object
     *
     * @returns {angular.IPromise}
     */
    ctrl.setDisplayPropertiesForSelectedTransaction = function () {
      $scope.transaction = angular.copy(dataForModal.Transaction);
      // $scope.transaction.Encounters = angular.copy($scope.Encounters);

      return ctrl.getLocationTimezone().then(locationTimezone => {
        // // set $$DateEntered
        $scope.transaction.$$DateEntered= new Date($scope.transaction.DateEntered);
        ctrl.displayDate = $scope.transaction.$$DateEntered;
        $scope.transaction.ValidDate = true;
        $scope.transaction.Provider = ctrl.getProviderName(
          $scope.transaction.ProviderUserId
        );
        var serviceCode = listHelper.findItemByFieldValue(
          dataForModal.ServiceCodes,
          'ServiceCodeId',
          $scope.transaction.ServiceCodeId
        );
        if (serviceCode != null) {
          $scope.transaction.AffectedAreaId = serviceCode.AffectedAreaId;
          var serviceType = listHelper.findItemByFieldValue(
            dataForModal.ServiceTypes,
            'ServiceTypeId',
            serviceCode.ServiceTypeId
          );

          if (serviceType != null) {
            $scope.transaction.ServiceType = serviceType.Description;
          }
        }
        if ($scope.transaction.TransactionTypeId === 4) {
          $scope.transaction.TransactionType = localize.getLocalizedString(
            'Negative (-) Adjustment'
          );
          var adjustmentType = listHelper.findItemByFieldValue(
            $scope.adjustmentTypes,
            'AdjustmentTypeId',
            $scope.transaction.AdjustmentTypeId
          );
          if (adjustmentType) {
            $scope.transaction.AdjustmentTypeName = adjustmentType.Description;
          }
        }
        var promptTitile =
          $scope.transaction.PromptTitle &&
          $scope.transaction.PromptTitle.length > 0
            ? ' - ' + $scope.transaction.PromptTitle
            : '';
        var promptValue =
          $scope.transaction.PaymentTypePromptValue &&
          $scope.transaction.PaymentTypePromptValue.length > 0
            ? ' : ' + $scope.transaction.PaymentTypePromptValue
            : '';

        $scope.transaction.DisplayType = $scope.transaction.PaymentType
          ? $scope.transaction.PaymentType
          : ctrl.getPaymentType($scope.transaction.PaymentTypeId) +
            promptTitile +
            promptValue;

        // Take backup of transaction to track changes on it.
        ctrl.transactionInitialCopy = angular.copy($scope.transaction);
        //force adjustment type dropdown to populate
        $scope.transaction.AdjustmentTypeId = null;
        $scope.transaction.ProviderUserId = null;
        $scope.transaction.PaymentTypeId = null;

        $timeout(function () {
          $timeout(function () {
            $scope.transaction.AdjustmentTypeId =
              ctrl.transactionInitialCopy.AdjustmentTypeId;
            $scope.transaction.ProviderUserId =
              ctrl.transactionInitialCopy.ProviderUserId;
            $scope.transaction.PaymentTypeId =
              ctrl.transactionInitialCopy.PaymentTypeId;
          });
        });
      });
    };

    // Initialize transaction's display properties
    ctrl.addInactiveAdjustmentTypeToDropDown();
    ctrl.setDisplayPropertiesForSelectedTransaction();
    //#endregion

    // #region - default focus
    ctrl.defaultFocus = function () {
      $timeout(function () {
        if ($scope.editMode)
          ctrl.setDisplayPropertiesForSelectedTransaction().then(function () {
            angular.element('#inpTransactionDate').find('input').focus();
          });
      }, 100);
    };
    ctrl.defaultFocus();
    //#endregion

    //#region Validate Transaction
    /**
     * Function to set min and max dates for validation
     *
     * @returns {angular.IPromise}
     */
    ctrl.setTransactionMinAndMaxDates = function () {
      return ctrl.getLocationTimezone().then(function (locationTimezone) {
        var todaysDate = timeZoneFactory.ConvertDateToMomentTZ(
          ctrl.now,
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
    // Initialize min and max dates for validation
    ctrl.setTransactionMinAndMaxDates();

    //Validate transaction object; return true if valid else return false.
    ctrl.validateTransaction = function () {
      $scope.transaction.invalidTooth = false;

      var isValidDate =
        $scope.transaction.DateEntered != '' &&
        angular.isDefined($scope.transaction.DateEntered) &&
        $scope.transaction.ValidDate &&
        $scope.transaction.ValidDate &&
        $scope.transaction.DateEntered != undefined &&
        $scope.transaction.DateEntered != null;
      var isValidPaymentType = $scope.transaction.PaymentTypeId > '';
      var isValidAdjustment = $scope.transaction.AdjustmentTypeId > '';

      if (!isValidDate) {
        $timeout(function () {
          angular.element('#inpTransactionDate').find('input').focus();
        }, 0);
        return false;
      }
      if ($scope.transaction.TransactionTypeId == 2) {
        if (!isValidPaymentType) {
          $timeout(function () {
            angular.element('#lstPaymentType').find('span').focus();
          }, 0);
          return false;
        }
      } else {
        if (!isValidAdjustment) {
          $timeout(function () {
            angular.element('#lstAdjustmentType').find('span').focus();
          }, 0);
          return false;
        }
      }

      return true;
    };

    //#region open new encounter tab

    $scope.openEncounterTab = function (encounterId) {
      // Open AccountSummary with the encounter open
      let patientPath = '#/Patient/';
      tabLauncher.launchNewTab(
        patientPath +
          $scope.patientInfo.PersonAccount.PersonId +
          '/Summary?tab=Account Summary&open=new&encounterId=' +
          encounterId
      );
    };

    //#end region

    //#endregion
    //#region Navigate to Account Summary
    // Function to handle navigation to account summary for selected encounter(s)
    $scope.navigateToAccountSummary = function (IdToExpand, transactionTypeId) {
      ctrl.encounterIdToExpand = IdToExpand;
      ctrl.transactiontypeid = transactionTypeId;
      ctrl.checkForDataChange(ctrl.navigateAndClose);
    };
    // Navigation to account summary and close the transaction details modal
    ctrl.navigateAndClose = function () {
      var transactionToSearchEncounter = {
        encounterId: ctrl.encounterIdToExpand,
        transactionTypeId: ctrl.transactiontypeid,
        intent: 'SearchAllEncounters',
      };

      $scope.$emit(
        'navigate-to-related-encounters',
        transactionToSearchEncounter
      );
      $uibModalInstance.dismiss();
    };
    //#endregion

    //#region Save Transaction

    // Function to save changes made in the transaction
    $scope.saveTransaction = function () {
      $scope.isSaveButtonclicked = true;
      if (ctrl.authEditAccess()) {
        $scope.validateFlag = false;
        if (ctrl.validateTransaction() && !$scope.alreadySaving) {
          var creditTransaction = angular.copy(dataForModal.CreditTransaction);
          var previousPaymentType = _.find($scope.paymentTypes, {
            PaymentTypeId: creditTransaction.PaymentTypeId,
          });
          var paymentType = _.find($scope.paymentTypes, {
            PaymentTypeId: $scope.transaction.PaymentTypeId,
          });

          // set DateEntered if $$DateEntered has changed from original displayDate
          ctrl.setDateEntered($scope.transaction, ctrl.displayDate);
          if (
            creditTransaction.DateEntered !== $scope.transaction.DateEntered
          ) {
            // Set ObjectState to "Update" if date was changed from UI
            creditTransaction.DateEntered = $scope.transaction.DateEntered;
            angular.forEach(
              creditTransaction.CreditTransactionDetails,
              function (creditTransactionDetails) {
                if (creditTransactionDetails.ObjectState == null) {
                  creditTransactionDetails.ObjectState = saveStates.None;
                  creditTransactionDetails.Amount =
                    creditTransactionDetails.Amount < 0
                      ? creditTransactionDetails.Amount * -1
                      : creditTransactionDetails.Amount;
                }
              }
            );
          } else if (
            (paymentType &&
              previousPaymentType &&
              paymentType.PaymentTypeId === previousPaymentType.PaymentTypeId &&
              paymentType.Prompt) ||
            creditTransaction.Note !== $scope.transaction.Note
          ) {
            // updating a check payment for the same date doesn't re-create the payment. Must set detail amounts to positive.
            _.forEach(
              creditTransaction.CreditTransactionDetails,
              creditTransactionDetails => {
                if (creditTransactionDetails.ObjectState == null) {
                  creditTransactionDetails.ObjectState = saveStates.None;
                }
                creditTransactionDetails.Amount = Math.abs(
                  creditTransactionDetails.Amount
                );
              }
            );
          } else {
            // If date was not changed from UI then set ObjectState to "None"
            angular.forEach(
              creditTransaction.CreditTransactionDetails,
              function (creditTransactionDetails) {
                if (creditTransactionDetails.ObjectState == null) {
                  creditTransactionDetails.ObjectState = saveStates.None;
                  creditTransactionDetails.Amount =
                    creditTransactionDetails.Amount < 0
                      ? creditTransactionDetails.Amount * -1
                      : creditTransactionDetails.Amount;
                }
              }
            );
          }

          if (creditTransaction.TransactionTypeId == 2) {
            creditTransaction.PaymentTypeId = $scope.transaction.PaymentTypeId;
            creditTransaction.PaymentTypePromptValue =
              $scope.transaction.PaymentTypePromptValue;
          } else {
            creditTransaction.AdjustmentTypeId =
              $scope.transaction.AdjustmentTypeId;
            creditTransaction.Note = $scope.transaction.Note;
          }

          creditTransaction.Description = null;
          creditTransaction.Amount =
            creditTransaction.Amount < 0
              ? parseFloat((creditTransaction.Amount * -1).toFixed(2))
              : creditTransaction.Amount;
          patientServices.CreditTransactions.update(
            { accountId: creditTransaction.AccountId },
            creditTransaction,
            ctrl.applyTransactionSuccess,
            ctrl.applyTransactionFailure
          );
        } else {
          $scope.validateFlag = true;
        }
      } else {
        if ($scope.transaction.TransactionTypeId == 2)
          ctrl.notifyNotAuthorized($scope.soarAuthEditKey);
        else ctrl.notifyNotAuthorized($scope.soartAuthCdtEditKey);
      }
      $scope.isSaveButtonclicked = false;
    };

    //Success callback function - to handle success response from server
    ctrl.applyTransactionSuccess = function () {
      $scope.transaction.alreadyUpdatingEncounter = false;
      ctrl.successMessage =
        $scope.transaction.TransactionTypeId == 2
          ? 'Payment'
          : 'Negative Adjustment';
      toastrFactory.success(
        localize.getLocalizedString('{0} updated successfully', [
          ctrl.successMessage,
        ]),
        localize.getLocalizedString('Success')
      );
      $uibModalInstance.close();
    };

    //Error callback function - to handle error from server
    ctrl.applyTransactionFailure = function (error) {
      if (!(error && error.status === 409)) {
        ctrl.messageString =
          $scope.transaction.TransactionTypeId === 2
            ? 'updating payment'
            : 'updating negative adjustment';
        toastrFactory.error(
          localize.getLocalizedString('An error has occurred while {0}', [
            ctrl.messageString,
          ]),
          localize.getLocalizedString('Error')
        );
      }
      $scope.transaction.alreadyUpdatingEncounter = false;
    };
    //#endregion

    //#region  make editable transaction
    $scope.editTransaction = function () {
      $scope.editMode = !$scope.editMode;
      ctrl.defaultFocus();
    };
    //#endregion

    //#region Navigate to Account Summary

    // Function to handle cancel button click event
    $scope.closeModal = function () {
      ctrl.checkForDataChange($uibModalInstance.dismiss);
    };

    // check for whether data has changed or not, if yes display confirmation message
    ctrl.checkForDataChange = function (func) {
      if ($scope.editMode) {
        ctrl.dataHasChanged = !angular.equals(
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
    //#endregion
    $scope.disableMessage = null;
    $scope.isVendorPayment =
      $scope.transaction.Description &&
      $scope.transaction.Description.toLowerCase().indexOf('vendor payment') !==
        -1
        ? true
        : false;
    if ($scope.transaction.IsAuthorized)
      $scope.disableMessage = 'Credit/Debit Card Payments cannot be edited';
    else if ($scope.transaction.IsDeposited) {
      $scope.disableMessage =
        'This payment is already deposited and it cannot be edited or deleted';
    } else if ($scope.isVendorPayment) {
      $scope.disableMessage =
        'This payment originated from a third party vendor and it cannot be edited.';
    }

    $scope.$watch(
      'encounters',
      function (nv, ov) {
        if (nv !== ov) {
          $timeout(function () {
            if ($scope.encounters.length > 1) {
              var serviceAmount = 0;
              angular.forEach($scope.unassignedTransactions, function (srvc) {
                serviceAmount += srvc.Amount;
              });
              angular.forEach($scope.encounters, function (srvc) {
                serviceAmount += srvc.Amount;
              });
              $scope.transaction.Amount = parseFloat(serviceAmount.toFixed(2));
            }
          });
        }
      },
      true
    );

    $scope.setTransactionDescription = function (id) {
      if (id === 5) {
        return localize.getLocalizedString('Positive (+) Adjustment');
      } else if (id === 6) {
        return localize.getLocalizedString('Finance Charge');
      }
    };
  },
]);
