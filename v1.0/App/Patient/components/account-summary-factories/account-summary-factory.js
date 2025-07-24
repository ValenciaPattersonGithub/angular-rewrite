'use strict';

angular.module('Soar.Patient').factory('AccountSummaryFactory', [
  'PatientServices',
  '$filter',
  'localize',
  'referenceDataService',
  'patSecurityService',
  'toastrFactory',
  'StaticData',
  'ListHelper',
  'NewAdjustmentTypesService',
  '$q',
  'TimeZoneFactory',
  'ModalFactory',
  'PaymentGatewayFactory',
  'DeleteInsurancePaymentFactory',
  '$location',
  'PaymentGatewayService',
  'userSettingsDataService',
  'LocationServices',
  '$sce',
  /**
   *
   * @param {*} patientServices
   * @param {angular.IFilterService} $filter
   * @param {*} localize
   * @param {{ getData: (name: string) => angular.IPromise<any>; }} referenceDataService
   * @param {*} patSecurityService
   * @param {*} toastrFactory
   * @param {*} staticData
   * @param {*} listHelper
   * @param {*} adjustmentTypesService
   * @param {angular.IQService} $q
   * @param {*} timeZoneFactory
   * @param {*} modalFactory
   * @param {*} paymentGatewayFactory
   * @param {*} deleteInsurancePaymentFactory
   * @param {angular.ILocationService} $location
   * @param {*} paymentGatewayService
   * @param {*} userSettingsDataService
   * @param {*} locationServices
   * @returns
   */
  function (
    patientServices,
    $filter,
    localize,
    referenceDataService,
    patSecurityService,
    toastrFactory,
    staticData,
    listHelper,
    adjustmentTypesService,
    $q,
    timeZoneFactory,
    modalFactory,
    paymentGatewayFactory,
    deleteInsurancePaymentFactory,
    $location,
    paymentGatewayService,
    userSettingsDataService,
    locationServices,
    $sce,
    
  ) {
    var factory = this;
    var soarAuthEnctrEditKey = 'soar-acct-enctr-edit';
    var soarAuthEnctrChkOutKey = 'soar-acct-enctr-chkout';
    var soarAuthEnctrDeleteKey = 'soar-acct-enctr-delete';
    var soarAuthInsPmtDeleteKey = 'soar-acct-aipmt-delete';

    factory.PaymentProviders = staticData.PaymentProviders();

    factory.GatewayTransactionType ={
      CreditCard : 1,
      DebitCard : 2,
      Interactive : 3
    };

    factory.CurrencyType ={
    Cash : 1,
    Check : 2,
    CreditCard :3,
    DebitCard :4,
    Other : 5
   };
   
   factory.cardType={
    Credit:1,
    Debit:2
   }



    var getAccountSummaryMain = function (accountId, filterObject) {
      return patientServices.AccountSummary.getAccountSummaryMain(
        { accountId: accountId },
        filterObject
      ).$promise;
    };

    var getTransactionHistory = function (accountId, filterObject) {
      return $q
        .all({
          summary: patientServices.AccountSummary.getTransactionHistory(
            { accountId: accountId },
            filterObject
          ).$promise.then(res => res.Value),
          locations: referenceDataService.getData(
            referenceDataService.entityNames.locations
          ),
        })
        .then(function (results) {
          if (results.summary && !_.isEmpty(results.summary)) {
            var cachedLocation = JSON.parse(
              sessionStorage.getItem('userLocation')
            );
            _.each(results.summary, row => {
              row.LocationId = _.isEqual(row.ObjectType, 'Document')
                ? cachedLocation.id
                : row.LocationId;
              var ofcLocation = _.find(results.locations, {
                LocationId: row.LocationId,
              });
              row.displayDate = $filter('toShortDisplayLocal')(
                row.Date,
                ofcLocation ? ofcLocation.Timezone : null
              );
              row.IsServiceLocationMatch = cachedLocation.id === row.LocationId;
              _.each(row.Claims, function (claim) {
                //really should fix up the encounter-claims directive instead of setting these properties on retrieval
                if (row.TransactionTypeId === 1) {
                  claim.TransactionTypeId = 1;
                }
                if (row.Type === 'Account Note') {
                  claim.TransactionType = 'Account Note';
                }
                if (row.Type === 'AcctNote') {
                  claim.TransactionType = 'AcctNote';
                }
                if (
                  claim.Status !== 7 &&
                  claim.Status !== 8 &&
                  claim.Type == 1
                ) {
                  row.hasOpenClaim = true;
                }
                if (
                  (claim.Status == 4 || claim.Status === 9) &&
                  claim.Type == 1
                ) {
                  row.InProcess = true;
                }
              });
            });
            return results.summary;
          } else {
            return [];
          }
        });
    };

    var getPendingEncounters = function (accountId, filterObject) {
      return $q
        .all({
          summary: patientServices.AccountSummary.getAccountSummaryPending(
            { accountId: accountId },
            filterObject
          ).$promise.then(res => res.Value),
          locations: referenceDataService.getData(
            referenceDataService.entityNames.locations
          ),
        })
        .then(function (results) {
          if (results.summary && _.isArray(results.summary.Rows)) {
            _.each(results.summary.Rows, function (row) {
              var ofcLocation = _.find(results.locations, {
                LocationId: row.LocationId,
              });
              row.displayDate = $filter('toShortDisplayTodayLocal')(
                row.Date,
                ofcLocation ? ofcLocation.Timezone : null
              );
              //cannot edit or checkout encounter if there are services for multiple locations on it
              row.$$isMultiLocationEncounter =
                !row.EncounterServiceLocationIds ||
                row.EncounterServiceLocationIds.length > 1;
              if (!row.$$isMultiLocationEncounter) {
                row.$$locationId = row.EncounterServiceLocationIds[0];
                //cannot edit or checkout encounter if the user is not authorized to edit or checkout at the encounter's location
                row.$$authorizedForEditOrCheckoutAtLocation =
                  patSecurityService.IsAuthorizedByAbbreviationAtLocation(
                    soarAuthEnctrEditKey,
                    row.$$locationId
                  ) ||
                  patSecurityService.IsAuthorizedByAbbreviationAtLocation(
                    soarAuthEnctrChkOutKey,
                    row.$$locationId
                  );
                //cannot delete encounter if the user is not authorized to delete at the encounter's location
                row.$$authorizedForDeleteAtLocation = patSecurityService.IsAuthorizedByAbbreviationAtLocation(
                  soarAuthEnctrDeleteKey,
                  row.$$locationId
                );
                var encounterLocation = _.find(results.locations, {
                  LocationId: row.$$locationId,
                });
                row.$$noEditOrCheckoutAccessTooltipMessage = localize.getLocalizedString(
                  'You do not have permission to edit/check out an encounter at {0} {1}.',
                  [encounterLocation ? encounterLocation.NameLine1 : '[inactive]', 'location']
                );
              } else {
                // Covers the unlikely scenario that encounter has services from multiple locations. No longer able to create in Fuse.
                row.$$authorizedForDeleteAtLocation = true;
                _.each(row.EncounterServiceLocationIds, function (loc) {
                  row.$$authorizedForDeleteAtLocation =
                    row.$$authorizedForDeleteAtLocation &&
                    patSecurityService.IsAuthorizedByAbbreviationAtLocation(
                      soarAuthEnctrDeleteKey,
                      loc
                    );
                });
              }
            });
            return results.summary.Rows;
          } else {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve {0}. Please try again.',
                ['pending encounters']
              ),
              'error'
            );
            return [];
          }
        });
    };

    // ARWEN: #509747 locations was an argument, but was not used.
    var getEncounterDetails = function (row, accountId, plans) {
      return $q
        .all({
          summary: patientServices.AccountSummary.getAccountSummaryRowDetail({
            id: row.ObjectId,
            type: row.ObjectType,
            accountId: accountId,
          }).$promise,
          locations: referenceDataService.getData(
            referenceDataService.entityNames.locations
          ),
        })
        .then(function (results) {
          var Items = results.summary.Value.Rows;
          var serviceTransactions = [];
          var creditTransactions = [];
          var debitTransactions = [];
          var accountNotes = [];
          row.retrieved = true;
          _.each(Items, function (item) {
            if (item.ObjectType === 'ServiceTransaction') {
              item.hasClaimInProcess = _.some(item.Claims, function (claim) {
                return (
                  (claim.Status === 4 || claim.Status === 9) && claim.Type == 1
                );
              });
              item.hasOpenClaim = _.some(item.Claims, function (claim) {
                return (
                  claim.Status !== 7 && claim.Status !== 8 && claim.Type == 1
                );
              });
              serviceTransactions.push(item);
            } else if (item.ObjectType === 'CreditTransaction') {
              if (
                item.Description &&
                item.Description.toLowerCase().indexOf('vendor payment') !== -1
              ) {
                item.isVendorPayment = true;
                item.toolTip =
                  'This payment originated from a third party vendor and it cannot be edited.';
              }
              creditTransactions.push(item);
            } else if (item.ObjectType === 'DebitTransaction') {
              if (
                item.Description &&
                item.Description.toLowerCase().indexOf('vendor payment refund') !== -1
              ) {
                item.isVendorPaymentRefund = true;
                item.toolTip =
                  'This debit originated from a third party vendor and it cannot be edited.';
              }
              debitTransactions.push(item);
            } else if (item.ObjectType === 'PersonAccountNote') {
              accountNotes.push(item);
            }
            var ofcLocation = _.find(results.locations, {
              LocationId: item.LocationId,
            });
            item.displayDate = $filter('toShortDisplayTodayLocal')(
              item.Date,
              ofcLocation ? ofcLocation.Timezone : null
            );
          });

          row.PatientBalance = results.summary.Value.PatientBalance;
          row.InsuranceBalance = results.summary.Value.InsuranceBalance;
          row.Items = Items;
          row.serviceTransactions = serviceTransactions;
          row.creditTransactions = creditTransactions;
          row.debitTransactions = debitTransactions;
          row.AccountMemberHasPlan =
            plans && plans[row.PersonId] && plans[row.PersonId].length > 0
              ? true
              : false;
          row.OpenClaims = _.find(row.serviceTransactions, s => {
            return (
              s.Claims &&
              _.find(s.Claims, c => {
                return c.Type == 1;
              })
            );
          })
            ? true
            : false;
          row.AnyServiceCanSubmit = _.find(row.serviceTransactions, {
            IsSubmittableOnClaim: true,
          })
            ? true
            : false;
        });
    };

    var viewOrEditAcctPaymentOrNegAdjustmentModal = function (
      detail,
      paymentTypes,
      accountMembersOptionsTemp,
      refreshSummaryPageDataForGrid
    ) {
      var adjustmentTypes = [];
      var resource = _.isEqual(detail.$$route, 'TransactionHx')
        ? 'getTransactionHistoryPaymentDetails'
        : 'getCreditTransactionByIdForAccount';
      var promises = [
        patientServices.CreditTransactions[resource]({
          accountId: detail.$$patientInfo.PersonAccount.AccountId,
          creditTransactionId: detail.ObjectId,
        }).$promise,
        referenceDataService.getData(
          referenceDataService.entityNames.locations
        ),
        referenceDataService.getData(referenceDataService.entityNames.users),
      ];

      // Get the list of encounters for account payments and negative adjustments (should always be call 4 (index 3) in the list)
      if (
        _.isEqual(detail.TransactionTypeId, 2) ||
        _.isEqual(detail.TransactionTypeId, 4)
      ) {
        promises.push(
          patientServices.CreditTransactions.getTransactionHistoryPaymentDetails(
            {
              accountId: detail.$$patientInfo.PersonAccount.AccountId,
              creditTransactionId: detail.ObjectId,
            }
          ).$promise
        );
      }

      // Call 5 (index 4) in the list
      if (_.isEqual(detail.TransactionTypeId, 4)) {
        promises.push(adjustmentTypesService.get({ active: false }));
      }

      $q.all(promises).then(function (res) {
        var creditTransaction = res[0] ? res[0].Value : res.Value;
        var locations = res[1];
        var providers = res[2];
        var locationTmp = _.find(locations, { LocationId: detail.LocationId });
        var locationTimezone = locationTmp ? locationTmp.Timezone : '';

        creditTransaction.TitleDate = timeZoneFactory
          .ConvertDateToMomentTZ(detail.Date, locationTimezone)
          .format('MM/DD/YYYY');
        creditTransaction.DateEntered = detail.Date;
        if (!creditTransaction.DateEntered.toLowerCase().endsWith('z')) {
          creditTransaction.DateEntered += 'Z';
        }
        creditTransaction.Location = locationTmp
          ? locationTmp.NameAbbreviation
          : '';
        creditTransaction.AccountMemberId =
          detail.$$patientInfo &&
          detail.$$patientInfo.PersonAccount.PersonAccountMember.AccountMemberId
            ? detail.$$patientInfo.PersonAccount.PersonAccountMember
                .AccountMemberId
            : detail.AccountMemberId;

        // Attach the encounters to the object
        if (
          !_.isUndefined(res[3]) &&
          !_.isUndefined(res[3].Value) &&
          !_.isEmpty(res[3].Value.Encounters)
        ) {
          creditTransaction.Encounters = res[3].Value.Encounters;
          creditTransaction.UnassignedTransactions = factory.setUnassignedTransactions(
            creditTransaction.Encounters,
            providers
          );

          // House keeping - remove unassigned transactions from encounters
          creditTransaction.Encounters.filter(
            val => !creditTransaction.UnassignedTransactions.includes(val)
          );
        }

        // Handle Transaction History
        if (!detail.$$editMode) {
          creditTransaction.ProviderUserId = detail.ProviderUserId;
          creditTransaction.Amount = detail.Amount;
          creditTransaction.TransactionTypeId = detail.TransactionTypeId;
          creditTransaction.TransactionType = detail.Type;
        }

        // Set adjustment types
        if (_.isEqual(res.length, 5)) {
          adjustmentTypes = res[4].Value;
        }

        var originalCreditTransaction = angular.copy(creditTransaction); //need an copy of the original credit, as this is what is used for the final update call. Do the date conversion first so comparisons work properly
        factory.prepCreditTransaction(
          creditTransaction,
          providers,
          paymentTypes,
          accountMembersOptionsTemp,
          detail.$$editMode
        );
        modalFactory
          .Modal({
            templateUrl:
              'App/Patient/components/credit-transaction-crud/credit-transaction-crud.html',
            keyboard: false,
            windowClass: 'modal-60',
            backdrop: 'static',
            controller: 'CreditTransactionCrudController',
            amfa:
              creditTransaction.TransactionTypeId === 2
                ? 'soar-acct-aapmt-edit'
                : 'soar-acct-cdtadj-edit',
            resolve: {
              DataForModal: function () {
                return {
                  EditMode: detail.$$editMode,
                  Patient: detail.$$patientInfo,
                  Transaction: creditTransaction,
                  CreditTransaction: originalCreditTransaction,
                  PaymentTypes: paymentTypes,
                  AdjustmentTypes: adjustmentTypes,
                };
              },
            },
          })
          .result.then(refreshSummaryPageDataForGrid);
      });
    };

    // credit-transaction-crud should be handling this, if credit-transaction-crud is refactored, this could be looked at again
    factory.prepCreditTransaction = function (
      creditTransaction,
      providers,
      paymentTypes,
      accountMembersOptionsTemp,
      editMode
    ) {
      var detail;
      if (editMode) {
        var paymentType = creditTransaction.PaymentTypeId
          ? _.find(paymentTypes, {
              PaymentTypeId: creditTransaction.PaymentTypeId,
            })
          : null;
        creditTransaction.PromptTitle = paymentType
          ? paymentType.Prompt || ''
          : '';
        creditTransaction.TransactionType =
          creditTransaction.TransactionTypeId === 2
            ? localize.getLocalizedString('Account Payment')
            : localize.getLocalizedString('Negative (-) Adjustment');
        creditTransaction.CreditTransactionDetails = _.filter(
          creditTransaction.CreditTransactionDetails,
          function (detail) {
            return _.find(accountMembersOptionsTemp, {
              accountMemberId: detail.AccountMemberId,
            });
          }
        );
        creditTransaction.Amount = _.sumBy(
          creditTransaction.CreditTransactionDetails,
          'Amount'
        );
        detail = _.find(creditTransaction.CreditTransactionDetails, {
          IsDeleted: false,
        });
        var provider = _.find(providers, {
          UserId: detail
            ? detail.ProviderUserId
            : creditTransaction.ProviderUserId,
        });
        creditTransaction.ProviderName = provider ? provider.UserCode : '';
      }
      creditTransaction.PatientDetailedName = _.find(
        accountMembersOptionsTemp,
        {
          accountMemberId: detail
            ? detail.AccountMemberId
            : creditTransaction.AccountMemberId,
        }
      ).patientDetailedName;
      var user = _.isUndefined(creditTransaction.PaymentAppliedByUser)
        ? _.find(providers, { UserId: creditTransaction.EnteredByUserId })
        : creditTransaction.PaymentAppliedByUser;
      creditTransaction.EnteredByName =
        user && _.isUndefined(creditTransaction.PaymentAppliedByUser)
          ? user.FirstName +
            ' ' +
            user.LastName +
            (user.ProfessionalDesignation
              ? ', ' + user.ProfessionalDesignation
              : '')
          : creditTransaction.PaymentAppliedByUser;
    };

    //Set up unassigned transactions
    // Takes optional parameter isRelatedDebitTransactions - to be set if the creditTransactionDetails is a list of related debit transactions
    factory.setUnassignedTransactions = function (encounters, providers) {
      var unassignedTransactionsList = [];
      _.forEach(encounters, function (encounter) {
        if (
          _.isNull(encounter.AppliedTransactionId) &&
          _.isNull(encounter.EncounterId)
        ) {
          var user = !_.isUndefined(encounter.ProviderUserId)
            ? _.find(providers, { UserId: encounter.ProviderUserId })
            : null;
          encounter.UnassignedText = localize.getLocalizedString('Unapplied');
          encounter.ProviderDisplayName = !_.isEmpty(user)
            ? user.FirstName +
              ' ' +
              user.LastName +
              (user.ProfessionalDesignation
                ? ', ' + user.ProfessionalDesignation
                : '')
            : null;
          unassignedTransactionsList.push(encounter);
        }
      });
      return unassignedTransactionsList;
    };
    //end region acct payment and neg adjustment

    // Region delete insurance payment

    var deleteInsurancePayment = function (
      item,
      patientName,
      refreshPageDataForGrid
    ) {
      if (
        !patSecurityService.IsAuthorizedByAbbreviation(soarAuthInsPmtDeleteKey)
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthInsPmtDeleteKey),
          'Not Authorized'
        );
        return;
      }
      var creditTransactionId = item.ObjectId;
      var transactionType = 'Insurance Payment';
      var title = localize.getLocalizedString('Delete {0}', [transactionType]);
      var buttonOkText = '';
      var buttonCancelText = '';
      var message = null;
      var message2 = null;
      // "Normal Path" - Payment associated with claim
      if (item.Claims[0] && item.Claims[0].ClaimId) {
        $q.all({
          transactions: patientServices.CreditTransactions.getTransactionHistoryPaymentInformation(
            {
              creditTransactionId: item.ObjectId,
              getAdditionalBulkPaymentInfo: false,
            }
          ).$promise.then(function (response) {
            return response.Value;
          }),
          locations: referenceDataService.getData(
            referenceDataService.entityNames.locations
          ),
        }).then(function (results) {
          paymentGatewayFactory
            .checkVoidInsurance(results.transactions.BulkCreditTransactionId)
            .get()
            .$promise.then(function (result) {
              var ofcLocation = _.find(results.locations, {
                LocationId: item.LocationId,
              });
              if (
                ofcLocation &&
                !ofcLocation.IsPaymentGatewayEnabled &&
                item.IsAuthorized &&
                item.$$paymentType.CurrencyTypeId === 3
              ) {
                buttonOkText = localize.getLocalizedString('Ok');
                buttonCancelText = localize.getLocalizedString('Cancel');
                message = localize.getLocalizedString(
                  'This payment was made using the Credit Card integration.  The Credit Card integration has since been disabled.  Deleting this payment will NOT return funds to the card.  Do you wish to continue?'
                );
              } else {
                buttonOkText = localize.getLocalizedString('Yes');
                buttonCancelText = localize.getLocalizedString('No');
                if (item.IsAuthorized) {
                  if (result.Value) {
                    message = localize.getLocalizedString(
                      'This payment has already been voided outside of Fuse. This action will only delete the payment from the Fuse ledger as the payment has already been returned to the card.'
                    );
                    message2 = localize.getLocalizedString(
                      "Are you sure you want to remove this {0} payment from {1}'s balance?",
                      [item.$$paymentType.Description, patientName]
                    );
                  } else {
                    /* eslint-disable no-template-curly-in-string */
                    message2 = localize.getLocalizedString(
                      'Are you sure you want to remove this {0}? The amount of ${1} will be refunded to the insurance company.',
                      [transactionType, Math.abs(item.Amount)]
                    );
                    /* eslint-enable no-template-curly-in-string */
                  }
                } else {
                  message2 = localize.getLocalizedString(
                    'Are you sure you want to delete this {0}?',
                    [transactionType]
                  );
                }
              }
              modalFactory
                .PaymentVoidConfirmModal(
                  title,
                  message,
                  message2,
                  buttonOkText,
                  buttonCancelText
                )
                .then(function () {
                  var urlParams = $location.search();
                  var prevLocation =
                    urlParams && urlParams.tab
                      ? urlParams.tab
                      : 'Account Summary';
                  let patientPath = '/Patient/';
                  var path = `${patientPath}${item.$$patientId}/Account/${item.$$accountId}/DeleteInsurancePayment/${creditTransactionId}/${prevLocation}`;
                  $location.path(path);
                });
            });
        });
      } else {
        // Exception path - most likely converted data payment and not associated with a claim
        item.AccountId = item.$$accountId;
        buttonOkText = localize.getLocalizedString('Yes');
        buttonCancelText = localize.getLocalizedString('No');
        message = localize.getLocalizedString(
          "This is a converted insurance payment. Deleting the payment will not apply the amount back to the patient's annual maximum. Are you sure you want to remove this {0}?",
          [transactionType]
        );
        modalFactory
          .ConfirmModal(title, message, buttonOkText, buttonCancelText)
          .then(
            function () {
              deleteInsurancePaymentFactory
                .deleteInsurancePayment(item, [])
                .then(function () {
                  toastrFactory.success(
                    localize.getLocalizedString(
                      'Insurance payment deleted successfully'
                    ),
                    localize.getLocalizedString('Success')
                  );
                  refreshPageDataForGrid();
                });
            },
            function () {
              refreshPageDataForGrid();
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to delete Insurance payment'
                ),
                localize.getLocalizedString('Error')
              );
            }
          );
      }
    };

    // TODO: Move this somewhere else
    let isVoided = false;

    //region acct payment and neg adjustment
    var deleteAcctPaymentOrNegAdjustment = async function (
      creditTransaction,
      paymentTypes,
      refreshDataForGrid
    ) {

      // Need to reset this variable for each delete/refund request
      isVoided = false;
      creditTransaction.transactionType =
        creditTransaction.TransactionTypeId === 2
          ? 'Account Payment'
          : 'Negative Adjustment';
      var title = localize.getLocalizedString('Delete {0}', [
        creditTransaction.transactionType,
      ]);
      var buttonOkText = 'Yes';
      var buttonCancelText = 'No';
      var message = null;
      var message2 = null;
      var paymentType = _.find(paymentTypes, {
        PaymentTypeId: creditTransaction.PaymentTypeId,
      });
      var currencyTypeId = paymentType ? paymentType.CurrencyTypeId : 0;
      var promises = [];
      var areYouSureMessage = 'Are you sure you want to delete this';

      var isVendorPayment =
        creditTransaction.Description.toLowerCase().indexOf(
          'vendor payment'
        ) !== -1
          ? true
          : false;

      var cardType = currencyTypeId && (currencyTypeId === factory.CurrencyType.CreditCard ||currencyTypeId ===factory.CurrencyType.DebitCard)  ? (currencyTypeId === factory.CurrencyType.CreditCard ?factory.cardType.Credit:factory.cardType.Debit):null;
      
      var transactionToBeRefunded;
      if(creditTransaction.IsAuthorized && cardType)
      {
        transactionToBeRefunded = await factory.getPaymentGatewayTransactionData(creditTransaction);
      } 

      if(transactionToBeRefunded && transactionToBeRefunded.PaymentProvider !== factory.PaymentProviders.OpenEdge) {
        cardType = transactionToBeRefunded.GatewayTransactionType === factory.GatewayTransactionType.CreditCard ? factory.cardType.Credit : factory.cardType.Debit;
      }

      if (creditTransaction.IsAuthorized) {
        if (cardType === factory.cardType.Credit) {
          if (!creditTransaction.$$ispaymentGatewayEnabled) {
            buttonOkText = 'Ok';
            buttonCancelText = 'Cancel';
            message = localize.getLocalizedString(
              'This payment was made using the Credit Card integration.  The Credit Card integration has since been disabled.  Deleting this payment will NOT return funds to the card.  Do you wish to continue?'
            );
          } else {
            // Bug 458140 Its possible that the amount on the row being deleted is not the full amount of the credit transaction but only a single detail row
            // from a creditTransaction having multiple details.  To prevent the amount not reflecting the correct $ amount we need to call to get the actual creditTransaction
            // and display that
            var creditAmount = creditTransaction.Amount;
            var creditTransactionPromise = patientServices.CreditTransactions.getCreditTransactionByIdForAccount(
              {
                accountId: creditTransaction.$$accountId,
                creditTransactionId: creditTransaction.ObjectId,
              }
            ).$promise.then(function (res) {
              creditAmount = res.Value ? res.Value.Amount : creditAmount;
            });
            promises.push(creditTransactionPromise);
            var gatewayPromise = paymentGatewayFactory
              .checkVoid(creditTransaction.ObjectId)
              .get()
              .$promise.then(function (result) {
                if (result.Value) {
                  message = localize.getLocalizedString(
                      'This payment has already been voided outside of Fuse. This action will only delete the payment from the Fuse ledger as the payment has already been returned to the card.'
                  );
                  message2 = localize.getLocalizedString(
                    areYouSureMessage + ' {0} {1}?',
                    [paymentType.Description, creditTransaction.transactionType]
                  );
                } else {
                  // if the credit amount equals the creditTransaction.Amount use current message
                  if (creditAmount === creditTransaction.Amount) {
                    message2 = localize.getLocalizedString(
                      'The total payment amount of {0}{1} will be refunded to the card holder.  Are you sure you want to delete this credit card payment?',
                      ['$', Math.abs(creditAmount).toFixed(2)]
                    );
                  } else {
                    // if the credit amount is more than the creditTransaction.Amount use multiple transaction warning
                    // eslint-disable-next-line no-template-curly-in-string
                    message2 = localize.getLocalizedString(
                      'This payment is distributed to multiple transactions.  The total payment amount of {0}{1} will be refunded to the card holder.  Are you sure you want to delete this credit card payment?',
                      ['$', Math.abs(creditAmount).toFixed(2)]
                    );
                  }
                }
              });
            promises.push(gatewayPromise);
          }
        } else if (cardType === factory.cardType.Debit) {
          var gatewayPromise = paymentGatewayFactory
            .checkVoid(creditTransaction.ObjectId)
            .get()
            .$promise.then(function (result) {
              isVoided = result.Value;
              if (isVoided) {
                // Payment was voided outside of Fuse
                message = localize.getLocalizedString(
                      'This payment has already been voided outside of Fuse. This action will only delete the payment from the Fuse ledger as the payment has already been returned to the card.'
                );
                message2 = localize.getLocalizedString(
                  areYouSureMessage + ' {0} {1}?',
                  [paymentType.Description, creditTransaction.transactionType]
                );
              } else {
                // Payment was not voided outside of Fuse
                message2 = localize.getLocalizedString(
                  areYouSureMessage +
                    ' {0} {1}? This transaction was tied to a debit card payment. A credit or debit card must be used to complete the refund.',
                  [creditTransaction.Description, creditTransaction.transactionType]
                );
              }
            });
            promises.push(gatewayPromise);
        } else {
          message2 = localize.getLocalizedString(
            areYouSureMessage +
              ' {0} {1}? This transaction was tied to a debit card payment. A credit or debit card must be used to complete the refund.',
            [creditTransaction.Description, creditTransaction.transactionType]
          );
        }
      } else {
        var paymentDetailsPromise = patientServices.CreditTransactions.getTransactionHistoryPaymentDetails(
          {
            accountId: creditTransaction.$$accountId,
            creditTransactionId: creditTransaction.ObjectId,
          }
        ).$promise.then(function (res) {
          if (!_.isUndefined(res) && !_.isUndefined(res.Value)) {
            creditTransaction.IsAppliedAcrossEncounters =
              res.Value.IsAppliedAcrossEncounters;

            buttonOkText = !creditTransaction.IsAppliedAcrossEncounters
              ? 'Yes'
              : 'Continue';
            buttonCancelText = !creditTransaction.IsAppliedAcrossEncounters
              ? 'No'
              : 'Cancel';
            message2 = creditTransaction.IsAppliedAcrossEncounters
              ? localize.getLocalizedString(
                  'This {0} is distributed to multiple transactions. If you continue, it will be deleted from all transactions.',
                  [creditTransaction.transactionType]
                )
              : localize.getLocalizedString(areYouSureMessage + ' {0} {1}?', [
                  creditTransaction.Description,
                  creditTransaction.transactionType,
                ]);

            if (isVendorPayment) {
              message2 += '\r\n';
              message2 += localize.getLocalizedString(
                "This account payment originated from a third party vendor. Deleting this payment in Fuse will not apply it back to the patient's card."
              );
            }
          }
        });
        promises.push(paymentDetailsPromise);
      }
      $q.all(promises).then(function () {
        modalFactory
          .PaymentVoidConfirmModal(
            title,
            message,
            message2,
            buttonOkText,
            buttonCancelText
          )
          .then(async function () {
          
            if (creditTransaction.IsAuthorized && cardType === factory.cardType.Debit) {
              
              if(transactionToBeRefunded && transactionToBeRefunded.PaymentProvider != factory.PaymentProviders.OpenEdge ){

                // Payment was voided outside of Fuse. Just finish the deletion
                if (isVoided) {
                  modalFactory.LoadingModal(
                    factory.finishDeleteAcctPaymentOrNegAdjustment(
                      creditTransaction,
                      null,
                      refreshDataForGrid
                    )
                  );
                  return;
                }

                const accountPaymentProviderDebitCardReturnDetails= await factory.accountPaymentProviderDebitCardReturn(creditTransaction,transactionToBeRefunded.PaymentGatewayTransactionId);
                const paymentGatewayTransactionId = accountPaymentProviderDebitCardReturnDetails.PaymentGatewayTransactionId;

                if(paymentGatewayTransactionId && transactionToBeRefunded.PaymentGatewayTransactionId){
                  const payPageUrl =await factory.getPayPageUrl(transactionToBeRefunded.LocationId,transactionToBeRefunded.PaymentGatewayTransactionId,paymentGatewayTransactionId);
                  if(payPageUrl){
                    const isPaymentDone= await factory.openPayPageModal(payPageUrl);

                    if(isPaymentDone){
                      paymentGatewayService.completeCreditTransaction(
                        accountPaymentProviderDebitCardReturnDetails,
                        5,
                        function (paymentGatewayTransactionId) {
                          modalFactory.LoadingModal(
                            factory.finishDeleteAcctPaymentOrNegAdjustment(
                              creditTransaction,
                              paymentGatewayTransactionId,
                              refreshDataForGrid
                            )
                          );
                        },
                        function (creditTransaction) {
                          return function (error) {
                            if (
                              !(error && (error.status === 409 || error.status === 404))
                            )
                              toastrFactory.error(
                                localize.getLocalizedString(
                                  'An error has occurred while deleting the {0}',
                                  [creditTransaction.transactionType]
                                ),
                                localize.getLocalizedString('Server Error')
                              );
                          };
                        }
                      )
                    }
                  }
                }


              } else {
                paymentGatewayService.patientAccountDebitCardReturn(
                  creditTransaction.$$accountId,
                  Math.abs(creditTransaction.Amount),
                  1,
                  false,
                  function (paymentGatewayTransactionId) {
                    modalFactory.LoadingModal(
                      factory.finishDeleteAcctPaymentOrNegAdjustment(
                        creditTransaction,
                        paymentGatewayTransactionId,
                        refreshDataForGrid
                      )
                    );
                  },
                  function (creditTransaction) {
                    return function (error) {
                      if (
                        !(error && (error.status === 409 || error.status === 404))
                      )
                        toastrFactory.error(
                          localize.getLocalizedString(
                            'An error has occurred while deleting the {0}',
                            [creditTransaction.transactionType]
                          ),
                          localize.getLocalizedString('Server Error')
                        );
                    };
                  }
                );
              }


            } else {
              modalFactory.LoadingModal(
                factory.finishDeleteAcctPaymentOrNegAdjustment(
                  creditTransaction,
                  null,
                  refreshDataForGrid
                )
              );
            }
          });
      });
    };

    factory.finishDeleteAcctPaymentOrNegAdjustment = function (
      creditTransaction,
      paymentGatewayTransactionId,
      refreshDataForGrid
    ) {
      return function () {
        return [
          {
            Call:
              creditTransaction.TransactionTypeId == 2
                ? patientServices.CreditTransactions.markAccountPaymentAsDeleted
                : patientServices.CreditTransactions
                    .markNegativeAdjustmentAsDeleted,
            Params: {
              CreditTransactionId: creditTransaction.ObjectId,
              AccountId: creditTransaction.$$accountId,
              DataTag: creditTransaction.DataTag,
              DeletedCreditTransactionDetailDtos: [],
              PaymentGatewayTransactionRefundId: paymentGatewayTransactionId,
            },
            OnSuccess: function (
              creditTransaction,
              paymentGatewayTransactionId
            ) {
              if (paymentGatewayTransactionId) {
                var message = localize.getLocalizedString('Refund Successful');
                var title = localize.getLocalizedString('Confirm');
                var buttonContinue = localize.getLocalizedString('Ok');
                modalFactory.ConfirmModal(title, message, buttonContinue);
              }
              toastrFactory.success(
                localize.getLocalizedString('{0} deleted successfully', [
                  creditTransaction.transactionType,
                ]),
                localize.getLocalizedString('Success')
              );
              refreshDataForGrid();
            },
            OnError: function (creditTransaction) {
              return function (error) {
                if (!(error && (error.status === 409 || error.status === 404)))
                  toastrFactory.error(
                    localize.getLocalizedString(
                      'An error has occurred while deleting the {0}',
                      [creditTransaction.transactionType]
                    ),
                    localize.getLocalizedString('Server Error')
                  );
              };
            },
          },
        ];
      };
    };

  factory.getPaymentGatewayTransactionData =async function(creditTransaction) {
      try {
          let result = await paymentGatewayFactory
              .getPaymentGatewayTransactionByCreditTransactionId(creditTransaction.ObjectId)
              .get()
              .$promise;
          return result.Value; // ✅ Return the value
      } catch (error) {
          console.error("Error fetching transaction details:", error);
          return null; // Handle error case
      }
   }

   factory.accountPaymentProviderDebitCardReturn = async function(creditTransaction,idOfTransactionToBeRefunded){

      try {
        let result = await paymentGatewayService.patientAccountPaymentProviderDebitCardReturn(
          creditTransaction.$$accountId,
          Math.abs(creditTransaction.Amount),
          1,
          false,
          idOfTransactionToBeRefunded
        ).$promise;
        return result.Value; // ✅ Return the value
      } catch (error) {
        console.error("Error fetching transaction:", error);
        return null; // Handle error case
    }

   }

 

  

   factory.getPayPageUrl= async function(locationId,oldTransactionPaymentGatewayTransactionId,PaymentGatewayTransactionId){

      var paymentIntentDto  = {
        LocationId: locationId,
        PaymentGatewayPaymentTransactionId: oldTransactionPaymentGatewayTransactionId,
        PaymentGatewayRefundTransactionId: PaymentGatewayTransactionId,
        RedirectUrl:location.origin + '/v1.0/index.html?v=1.0.0.1#/paypage-redirect-callback'
    }
  
 
    try {
      let result = await  patientServices.CreditTransactions.payPageReturnRequest(paymentIntentDto).$promise;
      const payPageUrl = $sce.trustAsResourceUrl(result.Value.PaypageUrl);
      return payPageUrl; // ✅ Return the value
    } catch (error) {
      console.error("Error get PayPageReturn Url:", error);
      return null; // Handle error case
    }
  
    }
  
   factory.openPayPageModal= async function(payPageUrl){
      try {
          let isPaymentDone = await  modalFactory.PayPageModal(payPageUrl );
          return isPaymentDone; // ✅ Return the value
      } catch (error) {
          console.error("Error open Payapge", error);
          return null; // Handle error
      }


    }

    //endregion

    return {
      getAccountSummaryMain: getAccountSummaryMain,
      getPendingEncounters: getPendingEncounters,
      getEncounterDetails: getEncounterDetails,
      getTransactionHistory: getTransactionHistory,
      viewOrEditAcctPaymentOrNegAdjustmentModal: viewOrEditAcctPaymentOrNegAdjustmentModal,
      prepCreditTransaction: factory.prepCreditTransaction,
      deleteInsurancePayment: deleteInsurancePayment,
      deleteAcctPaymentOrNegAdjustment: deleteAcctPaymentOrNegAdjustment,
      finishDeleteAcctPaymentOrNegAdjustment:
        factory.finishDeleteAcctPaymentOrNegAdjustment,
      setUnassignedTransactions: factory.setUnassignedTransactions,
      getPaymentGatewayTransactionData:factory.getPaymentGatewayTransactionData,
      accountPaymentProviderDebitCardReturn:factory.accountPaymentProviderDebitCardReturn,
      getPayPageUrl: factory.getPayPageUrl,
      PaymentProviders:factory.PaymentProviders,
      CurrencyType:factory.CurrencyType,
      GatewayTransactionType:factory.GatewayTransactionType
    };
  },
]);
