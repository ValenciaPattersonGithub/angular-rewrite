'use strict';
angular.module('common.factories').factory('PaymentGatewayFactory', [
  '$rootScope',
  '$resource',
  '$window',
  '$http',
  'SoarConfig',
  '$location',
  'localize',
  'ModalFactory',
  function (
    $rootScope,
    $resource,
    $window,
    $http,
    soarConfig,
    $location,
    localize,
    modalFactory
  ) {
    var paymentGatewayUrl = '_insurancesapi_/paymentGateway/';
    var paymentGatewayPageUrl = soarConfig.paymentGatewayUrl;
    var rootUrl = soarConfig.rootUrl;

    var storedTransactionInformation;
    var transactionId;
    var openEdgeWindow;
    var timer;
    var successCallback;
    var onErrorCallback;
    var completeType;

    // A Note about these different create methods:
    // We have to have this many methods/routes because of amfa's. You can create a
    // credit card payment for an AccountPayment, InsurancePayment, EncounterCheckout, and PositiveAdjustment.
    // Each of these functions have their own amfa, so naturally each payment gateway transaction call
    // needs to have a matching amfa. The methods themselves nothing differently between themselves, they are
    // different methods entirely for the purposes of amfa security.
    // Additionally, voiding any of these payments consists of an entirely other set of amfas.
    // This is how we end up with so many different methods that look so similar and do the same thing

    //object passed in to the resource methods need to have the following fields
    //{AccountId, GatewayAccountType, GatewayTransactionType, GatewayEntryMode,  GatewayChargeType, IsSignatureRequired, RequestedAmount}
    // GatewayAccountType is 0 for credit and 1 for debit card
    //GatewayTransactionType is 1 for credit, 2 for Debit and 3 for interactive
    //GatewayEntryMode is 1 for chip, 2 for swipe, 3 for keyed, 4 for Auto and 5 for Hid
    //GatewayChargeType is 1 for sale, 2 for purchase and 3 for refund
    //IsSignature required is a bool
    //Requested amount is the number for the transaction

    //resource methods
    function create() {
      return $resource(
        paymentGatewayUrl + 'accountpayment/createcredit',
        {},
        {
          post: { method: 'POST' },
        }
      );
    }

    function insuranceCreate() {
      return $resource(
        paymentGatewayUrl + 'insurancepayment/createcredit',
        {},
        {
          post: { method: 'POST' },
        }
      );
    }

    function bulkInsuranceCreate() {
      return $resource(
        paymentGatewayUrl + 'bulkinsurancepayment/createcredit',
        {},
        {
          post: { method: 'POST' },
        }
      );
    }

    function encounterCreate() {
      return $resource(
        paymentGatewayUrl + 'encounterpayment/createcredit',
        {},
        {
          post: { method: 'POST' },
        }
      );
    }

    function encounterVoid(paymentGatewayId) {
      return $resource(
        paymentGatewayUrl + 'encounterpayment/void/' + paymentGatewayId,
        {},
        {
          post: { method: 'POST' },
        }
      );
    }

    function returnCreate() {
      return $resource(
        paymentGatewayUrl + 'positiveadjustment/createdebit/',
        {},
        {
          post: { method: 'POST' },
        }
      );
    }

    function patientAccountReturnCreate() {
      return $resource(
        paymentGatewayUrl + 'accountpayment/debitreturn/',
        {},
        {
          post: { method: 'POST' },
        }
      );
    }

    function encounterReturnCreate() {
      return $resource(
        paymentGatewayUrl + 'encounterpayment/debitreturn/',
        {},
        {
          post: { method: 'POST' },
        }
      );
    }

    function checkVoid(creditTransactionId) {
      var encodedCreditTransactionId = encodeURIComponent(creditTransactionId);
      return $resource(
        `${paymentGatewayUrl}accountPayment/isVoided/${encodedCreditTransactionId}`
      );
    }

    function checkVoidInsurance(bulkCreditTransactionId) {
      var encodedBulkCreditTransactionId = encodeURIComponent(
        bulkCreditTransactionId
      );
      return $resource(
        `${paymentGatewayUrl}insurancePayment/isVoided/${encodedBulkCreditTransactionId}`
      );
    }

    function getPaymentGatewayTransactionByCreditTransactionId(creditTransactionId){
      var encodedCreditTransactionId = encodeURIComponent(creditTransactionId);
      return $resource(
        `${paymentGatewayUrl}creditTransactions/${encodedCreditTransactionId}/gatewayTransaction`
      );

    }
    //submit method
    function submitTransaction(
      transactionInformation,
      createType,
      callback,
      errorCallback
    ) {
      var windowHeight = 1;
      var windowWidth = 1;
      storedTransactionInformation = transactionInformation;
      transactionId = transactionInformation.PaymentGatewayTransactionId;
      completeType = createType;

      if (typeof callback === 'function') {
        successCallback = callback;
      }
      if (typeof errorCallback === 'function') {
        onErrorCallback = errorCallback;
      }

      var transactionType;
      var chargeType;
      var entryMode;
      var accountType = '';
      var promptSignature = '';
      var partialApproval = '';
      //Begin sorting and creating the string we will use to generate the HTML for openEdge child window
      if (transactionInformation.GatewayTransactionType === 1) {
        transactionType = 'CREDIT_CARD';
      } else if (transactionInformation.GatewayTransactionType === 2) {
        transactionType = 'DEBIT_CARD';
      } else {
        transactionType = 'INTERACTIVE';
      }

      if (transactionInformation.GatewayChargeType === 1) {
        chargeType = 'SALE';
      } else if (transactionInformation.GatewayChargeType === 2) {
        chargeType = 'PURCHASE';
      } else if (transactionInformation.GatewayChargeType === 3) {
        chargeType = 'REFUND';
      } else if (transactionInformation.GatewayChargeType === 4) {
        chargeType = 'CREDIT';
      }

      switch (transactionInformation.GatewayEntryMode) {
        case 0:
          entryMode = 'EMV';
          break;
        case 1:
          entryMode = 'EMV';
          break;
        case 2:
          entryMode = 'SWIPED';
          break;
        case 3:
          entryMode = 'KEYED';
          break;
        case 4:
          entryMode = 'AUTO';
          break;
        case 5:
          entryMode = 'HID';
          break;
      }
      if (transactionInformation.GatewayEntryMode === 3) {
        windowWidth = 700;
        windowHeight = 650;
      }

      if (transactionInformation.GatewayTransactionType === 2) {
        accountType =
          '&account_type=' + transactionInformation.GatewayAccountType;
      }
      if (transactionInformation.GatewayTransactionType === 1) {
        partialApproval = '&partial_approval_flag=true';
        promptSignature = '&prompt_signature=true';
      }

      var myForm =
        paymentGatewayPageUrl +
        '?account_token=' +
        transactionInformation.MerchantId +
        '&transaction_type=' +
        transactionType +
        '&charge_type=' +
        chargeType +
        accountType +
        partialApproval +
        '&entry_mode=' +
        entryMode +
        '&return_url=' +
        rootUrl +
        '/v1.0/app/Common/components/payment-gateway/payment-gateway.html&charge_total=' +
        transactionInformation.RequestedAmount +
        promptSignature +
        '&order_id=' +
        transactionInformation.PaymentGatewayTransactionId;
      //open Edge Styling
      // Customer info field options
      myForm += '&bill_customer_title_visible=false';
      myForm += '&bill_first_name_visible=false';
      myForm += '&bill_middle_name_visible=false';
      myForm += '&bill_last_name_visible=false';
      myForm += '&bill_company_visible=false';
      myForm += '&order_information_visible=false';
      myForm += '&card_information_visible=false';
      myForm +=
        '&customer_information_label=Providing a billing address or zip code may reduce your rate';
      //myForm += "&bill_country_code=US";
      //myForm += "&bill_state_or_province_label=State";
      //myForm += "&bill_state_or_province=false"
      myForm += '&bill_postal_code_label=Zip Code';

      // OpenEdge branding
      myForm += "&font-family='Open Sans', sans-serif;";
      myForm += '&font-size=14px;';
      myForm += '&section-header-font-size=18px;'; // Doesn't seem to have any effect.
      myForm += '&color=%236A7575;';
      myForm += '&background-color=%23FAFAFA;';
      myForm += '&input-field-height=30px;';
      myForm += '&line-spacing-size=0px;';
      myForm += '&btn-color=%23FFFFFF;';
      myForm += '&btn-background-color=%232DABCB;';
      myForm += '&btn-height=40px;';
      myForm += '&btn-width=150px;';
      myForm += '&btn-border-top-left-radius=4px;';
      myForm += '&btn-border-top-right-radius=4px;';
      myForm += '&btn-border-bottom-left-radius=4px;';
      myForm += '&btn-border-bottom-right-radius=4px;';
      myForm += '&btn-border-color=%232DABCB;';
      myForm += '&btn-border-style=solid;';
      myForm += '&btn-border-width=1px;';
      myForm += '&btn-font-size=14px;';

      var body =
        '<html><head></head><body><form id=submitToOpenEdge method="post" action="' +
        myForm +
        '"><script> document.getElementById("submitToOpenEdge").submit();</script></form></body></html>';
      var params = 'top=0,width=' + windowWidth + ',height=' + windowHeight;
      //This opens the child window
      openEdgeWindow = $window.open('', 'OpenEdge', params);
      if (openEdgeWindow != null) {
        try {
          openEdgeWindow.document.write(body);
        } catch (error) {
          //if the open edge window is already open, it is controlled by the
          //open edge domain, and trying to write to it will throw a cross domain error.
          //here we catch and handle that case. Intended behavior is to close the previously opened modal,
          //tell the user what happened, and give them an opportunity to retry their current payment or cancel
          localStorage.setItem('abortOpenEdge', true);
          openEdgeWindow.close();
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
          openEdgeWindow = null;
          modalFactory
            .ConfirmModal(
              localize.getLocalizedString('Credit Card Payment'),
              localize.getLocalizedString(
                'A credit card payment was already started on another tab and has been canceled.  Do you wish to continue with the current payment?'
              ),
              localize.getLocalizedString('Yes'),
              localize.getLocalizedString('No')
            )
            .then(
              function () {
                submitTransaction(
                  transactionInformation,
                  createType,
                  callback,
                  errorCallback
                );
              },
              function () {
                if (errorCallback) errorCallback();
              }
            );
          return false;
        } finally {
          //we only want to setup the timer if this window was properly initiated for this open edge attempt
          if (openEdgeWindow != null) {
            timer = setInterval(checkChild, 500);
          }
        }
      } else {
        return false;
      }
    }
    //when the child window closes we complete the open edge process
    function checkChild() {
      if (openEdgeWindow.closed) {
        clearInterval(timer);
        completeTransaction();
      }
    }

    var completeCreditTransaction = function(
      transactionInformation,
      completeTypeParam,
      successCallbackFn,
      errorCallbackFn
    ) {
      storedTransactionInformation =transactionInformation;
      transactionId = transactionInformation.PaymentGatewayTransactionId;
      completeType  = completeTypeParam;
   
      if (typeof successCallbackFn === 'function') {
        successCallback =successCallbackFn;
      }
      if (typeof errorCallbackFn === 'function') {
        onErrorCallback = errorCallbackFn;
      }
      completeTransaction();
    }

    function completeTransaction() {
      var abort = false;
      if (localStorage.getItem('abortOpenEdge')) {
        abort = true;
        localStorage.removeItem('abortOpenEdge');
      }
      if (completeType === 1) {
        var complete = $resource(
          paymentGatewayUrl + 'accountpayment/complete/' + transactionId,
          {},
          {
            post: { method: 'POST' },
          }
        );
      } else if (completeType === 2) {
        var complete = $resource(
          paymentGatewayUrl + 'insurancepayment/complete/' + transactionId,
          {},
          {
            post: { method: 'POST' },
          }
        );
      } else if (completeType === 3) {
        var complete = $resource(
          paymentGatewayUrl + 'encounterpayment/complete/' + transactionId,
          {},
          {
            post: { method: 'POST' },
          }
        );
      } else if (completeType === 4) {
        var complete = $resource(
          paymentGatewayUrl + 'positiveadjustment/complete/' + transactionId,
          {},
          {
            post: { method: 'POST' },
          }
        );
      } else if (completeType === 5) {
        var complete = $resource(
          paymentGatewayUrl +
            'accountpayment/debitreturn/complete/' +
            transactionId,
          {},
          {
            post: { method: 'POST' },
          }
        );
      } else if (completeType === 6) {
        var complete = $resource(
          paymentGatewayUrl +
            'encounterpayment/debitreturn/complete/' +
            transactionId,
          {},
          {
            post: { method: 'POST' },
          }
        );
      } else if (completeType === 7) {
        var complete = $resource(
          paymentGatewayUrl + 'bulkinsurancepayment/complete/' + transactionId,
          {},
          {
            post: { method: 'POST' },
          }
        );
      }

      var paymentComplete = complete.post({ uiSuppressModal: false });
      paymentComplete.$promise.then(
        function (data) {
          if (data.Value.GatewayStatus === 3) {

            // Set the transaction type from the complete response
            setGatewayTransactionTypeMap(data.Value);

            if (data.Value.ApprovedAmount < data.Value.RequestedAmount) {
              partialPaymentModal(
                data.Value.CardNumberLastFour,
                data.Value.ApprovedAmount
              );
            } else {
              if (
                completeType === 4 ||
                completeType === 5 ||
                completeType === 6
              ) {
                //credit and debit return
                alertModalAsynch('Refund Approved', successCallback);
              } else if (completeType === 2) {
                //On the insurance page I can interfere with work flow
                alertModal('Amount Approved', successCallback);
              } else if (completeType === 7) {
                //On the bulk payment page the approved modal can interfere with work flow (if closing claim) so we won't show it
                if (successCallback) {
                  successCallback(transactionId);
                }
              } else {
                //catch all for future work
                alertModalAsynch('Amount Approved', successCallback);
              }
            }
          } else if (data.Value.GatewayStatus === 4) {
            if (
              !data.Value.SecondaryResponseMessage ||
              data.Value.SecondaryResponseMessage == 'NULL'
            ) {
              alertModal(
                'Payment Declined, No Reason Given. Response Code: ' +
                  data.Value.SecondaryResponseCode,
                onErrorCallback
              );
            } else {
              alertModal(
                'Payment Declined, ' +
                  data.Value.SecondaryResponseMessage +
                  '. Response Code: ' +
                  data.Value.SecondaryResponseCode,
                onErrorCallback
              );
            }
          } else if (data.Value.GatewayStatus === 5) {
            if (
              storedTransactionInformation.GatewayTransactionType === 1 &&
              !abort
            ) {
              keyedEntryModal();
            } else {
              alertModalAsynch(
                'The credit card machine has failed to complete the transaction.',
                onErrorCallback
              );
            }
          } else if (data.Value.GatewayStatus === 6) {
            alertModalAsynch(
              'The credit card machine has failed to complete the transaction.',
              onErrorCallback
            );
          }
        },
        function (data) {
          alertModal('API call failed');
          //API call failed
        }
      );
    }

    function setGatewayTransactionTypeMap(transaction) {
      // Set GatewayTransactionType in session storage. This probably needs to
      // be handled differently at some point, but passing these values from
      // AngularJS to Angular is tough wihtout using session storage
      const transactionMapString = sessionStorage.getItem('payment-provider-transaction-map');
      const transactionMapObject = transactionMapString ? JSON.parse(transactionMapString) : [];
      transactionMapObject.push({id: transaction.PaymentGatewayTransactionId, type: transaction.GatewayTransactionType});
      sessionStorage.setItem('payment-provider-transaction-map', JSON.stringify(transactionMapObject));
    }

    var acceptPartialPayment = function (approvedAmount) {
      return function () {
        if (typeof successCallback === 'function') {
          successCallback(transactionId, approvedAmount);
        }
      };
    };

    var declinePartialPayment = function () {
      var voidType;
      if (completeType === 1) {
        voidType = $resource(
          paymentGatewayUrl + 'accountpayment/void/' + transactionId,
          {},
          {
            post: { method: 'POST' },
          }
        );
      } else if (completeType === 2) {
        voidType = $resource(
          paymentGatewayUrl + 'insurancepayment/void/' + transactionId,
          {},
          {
            post: { method: 'POST' },
          }
        );
      } else if (completeType === 3) {
        voidType = $resource(
          paymentGatewayUrl + 'encounterpayment/void/' + transactionId,
          {},
          {
            post: { method: 'POST' },
          }
        );
      }

      var voidPayment = voidType.post({ uiSuppressModal: false });
      voidPayment.$promise.then(
        function (data) {},
        function (data) {}
      );
      onErrorCallback();
    };
    //modal methods
    var alertModal = function (messageText, successCallback) {
      var message = localize.getLocalizedString(messageText);
      var title = localize.getLocalizedString('Confirm');
      var buttonContinue = localize.getLocalizedString('Ok');
      modalFactory
        .ConfirmModal(title, message, buttonContinue)
        .then(function () {
          if (successCallback) {
            successCallback(transactionId);
          }
        });
    };
    var alertModalAsynch = function (messageText, successCallback) {
      var message = localize.getLocalizedString(messageText);
      var title = localize.getLocalizedString('Confirm');
      var buttonContinue = localize.getLocalizedString('Ok');
      modalFactory.ConfirmModal(title, message, buttonContinue);
      if (successCallback) {
        successCallback(transactionId);
      }
    };
    var keyedEntryModal = function () {
      var keyedEntry = JSON.parse(sessionStorage.getItem('keyedEntry'));
      if (keyedEntry === null) {
        var confirmMessage = localize.getLocalizedString(
          'The credit card machine has failed to complete the transaction. Would you like to complete a keyed entry now?'
        );
        var confirmTitle = localize.getLocalizedString('Confirm');
        var buttonContinue = localize.getLocalizedString('Yes');
        var buttonCancel = localize.getLocalizedString('No');
        modalFactory
          .ConfirmModal(
            confirmTitle,
            confirmMessage,
            buttonContinue,
            buttonCancel
          )
          .then(
            function () {
              storedTransactionInformation.GatewayEntryMode = 3;
              submitTransaction(
                storedTransactionInformation,
                completeType,
                successCallback,
                onErrorCallback
              );
              sessionStorage.setItem('keyedEntry', 'true');
            },
            function () {
              if (onErrorCallback) {
                onErrorCallback();
              }
            }
          );
      } else if (keyedEntry === true) {
        if (storedTransactionInformation.GatewayEntryMode !== 3) {
          storedTransactionInformation.GatewayEntryMode = 3;
          submitTransaction(
            storedTransactionInformation,
            completeType,
            successCallback,
            onErrorCallback
          );
        } else if (onErrorCallback) {
          onErrorCallback();
        }
      } else {
        alertModalAsynch(
          'The credit card machine has failed to complete the transaction.',
          onErrorCallback
        );
      }
    };
    var partialPaymentModal = function (lastFourOfCard, approvedAmount) {
      var confirmMessage = localize.getLocalizedString(
        // eslint-disable-next-line no-template-curly-in-string
        'Only a partial amount of the payment from the card ending in {0} has been approved. Do you want to apply ${1} to the account?',
        [lastFourOfCard, approvedAmount]
      );
      var confirmTitle = localize.getLocalizedString('Confirm');
      var buttonContinue = localize.getLocalizedString('Yes');
      var buttonCancel = localize.getLocalizedString('No');
      modalFactory
        .ConfirmModal(
          confirmTitle,
          confirmMessage,
          buttonContinue,
          buttonCancel
        )
        .then(acceptPartialPayment(approvedAmount), declinePartialPayment);
    };

    var cleanup = function () {
      if (timer) {
        clearInterval(timer);
      }
      if (openEdgeWindow && !openEdgeWindow.closed) {
        openEdgeWindow.close();
      }
      if (onErrorCallback && typeof onErrorCallback === 'function') {
        onErrorCallback();
      }
    };

    //catch all for closing the open edge window on associated application close
    $window.addEventListener('unload', cleanup);

    return {
      create: create,
      insuranceCreate: insuranceCreate,
      bulkInsuranceCreate: bulkInsuranceCreate,
      encounterCreate: encounterCreate,
      encounterVoid: encounterVoid,
      submitTransaction: submitTransaction,
      returnCreate: returnCreate,
      patientAccountReturnCreate: patientAccountReturnCreate,
      encounterReturnCreate: encounterReturnCreate,
      checkVoid: checkVoid,
      checkVoidInsurance: checkVoidInsurance,
      completeCreditTransaction: completeCreditTransaction,
      getPaymentGatewayTransactionByCreditTransactionId: getPaymentGatewayTransactionByCreditTransactionId,
      isWindowOpen: function () {
        return openEdgeWindow && !openEdgeWindow.closed ? true : false;
      },
      forceCloseWindow: cleanup,
     
    };
  },
]);
