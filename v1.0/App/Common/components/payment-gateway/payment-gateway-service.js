'use strict';

var app = angular.module('common.services');

app.service('PaymentGatewayService', [
  '$rootScope',
  '$resource',
  '$window',
  'toastrFactory',
  'PaymentGatewayFactory',
  function (
    $rootScope,
    $resource,
    $window,
    toastrFactory,
    paymentGatewayFactory
  ) {
    //object passed in needs to have the following fields
    //{{AccountId, GatewayAccountType, GatewayTransactionType, GatewayEntryMode,  GatewayChargeType, IsSignatureRequired, RequestedAmount}}
    // GatewayAccountType is 0 for credit and 1 for debit card
    //GatewayTransactionType is 1 for credit, 2 for Debit and 3 for interactive
    //GatewayEntryMode is 1 for chip, 2 for swipe, 3 for keyed, 4 for Auto and 5 for Hid
    //GatewayChargeType is 1 for sale, 2 for purchase and 3 for refund
    //IsSignature required is a bool
    //Requested amount is the number for the transaction

    var PaymentCategory ={
      Encounter:0,
      AccountPayment:1,
      Insurance:2
    }
    var createCreditForEncounter = function (
      AccountId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired,
      successCallback,
      errorCallback
    ) {
      var GatewayAccountType = 0;
      var GatewayTransactionType = 1;
      var GatewayChargeType = 1;
      if (!signatureRequired) {
        signatureRequired = false;
      }
      var IsSignatureRequired = signatureRequired;
      var RequestedAmount = requestedAmount;

      paymentGatewayFactory
        .encounterCreate()
        .post(
          {
            AccountId: AccountId,
            GatewayAccountType: GatewayAccountType,
            GatewayTransactionType: GatewayTransactionType,
            GatewayEntryMode: GatewayEntryMode,
            GatewayChargeType: GatewayChargeType,
            IsSignatureRequired: IsSignatureRequired,
            RequestedAmount: RequestedAmount,
          },
          function (result) {
            paymentGatewayFactory.submitTransaction(
              result.Value,
              3,
              successCallback,
              errorCallback
            );
          }
        );
    };
    
    var createDebitForEncounter = function (
      AccountId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired,
      successCallback,
      errorCallback
    ) {
      var GatewayAccountType = 2;
      var GatewayTransactionType = 2;
      var GatewayChargeType = 2;
      if (!signatureRequired) {
        signatureRequired = false;
      }
      var IsSignatureRequired = signatureRequired;
      var RequestedAmount = requestedAmount;

      paymentGatewayFactory
        .encounterCreate()
        .post(
          {
            AccountId: AccountId,
            GatewayAccountType: GatewayAccountType,
            GatewayTransactionType: GatewayTransactionType,
            GatewayEntryMode: GatewayEntryMode,
            GatewayChargeType: GatewayChargeType,
            IsSignatureRequired: IsSignatureRequired,
            RequestedAmount: RequestedAmount,
          },
          function (result) {
            paymentGatewayFactory.submitTransaction(
              result.Value,
              3,
              successCallback,
              errorCallback
            );
          }
        );
    };

    var encounterVoid = function (paymentGatewayId) {
      paymentGatewayFactory.encounterVoid(paymentGatewayId).post(
        {},
        function (response) {
          console.log('void success', response);
        },
        function (response) {
          console.log('void failure', response);
        }
      );
    };

    var createCreditForInsurance = function (
      AccountId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired,
      successCallback,
      errorCallback
    ) {
      var GatewayAccountType = 0;
      var GatewayTransactionType = 1;
      var GatewayChargeType = 1;
      if (!signatureRequired) {
        signatureRequired = false;
      }
      var IsSignatureRequired = signatureRequired;
      var RequestedAmount = requestedAmount;

      paymentGatewayFactory
        .insuranceCreate()
        .post(
          {
            AccountId: AccountId,
            GatewayAccountType: GatewayAccountType,
            GatewayTransactionType: GatewayTransactionType,
            GatewayEntryMode: GatewayEntryMode,
            GatewayChargeType: GatewayChargeType,
            IsSignatureRequired: IsSignatureRequired,
            RequestedAmount: RequestedAmount,
          },
          function (result) {
            paymentGatewayFactory.submitTransaction(
              result.Value,
              2,
              successCallback,
              errorCallback
            );
          }
        );
    };

    var createCreditForBulkInsurance = function (
      carrierId,
      payerId,
      paymentTypeId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired,
      successCallback,
      errorCallback
    ) {
      var GatewayAccountType = 0;
      var GatewayTransactionType = 1;
      var GatewayChargeType = 1;
      if (!signatureRequired) {
        signatureRequired = false;
      }
      var IsSignatureRequired = signatureRequired;
      var RequestedAmount = requestedAmount;

      paymentGatewayFactory
        .bulkInsuranceCreate()
        .post(
          {
            CarrierId: carrierId,
            PayerId: payerId,
            PaymentTypeId: paymentTypeId,
            GatewayAccountType: GatewayAccountType,
            GatewayTransactionType: GatewayTransactionType,
            GatewayEntryMode: GatewayEntryMode,
            GatewayChargeType: GatewayChargeType,
            IsSignatureRequired: IsSignatureRequired,
            RequestedAmount: RequestedAmount,
          },
          function (result) {
            paymentGatewayFactory.submitTransaction(
              result.Value,
              7,
              successCallback,
              errorCallback
            );
          }
        );
    };

    var createCredit = function (
      AccountId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired,
      successCallback,
      errorCallback
    ) {
      var GatewayAccountType = 0;
      var GatewayTransactionType = 1;
      var GatewayChargeType = 1;
      if (!signatureRequired) {
        signatureRequired = false;
      }
      var IsSignatureRequired = signatureRequired;
      var RequestedAmount = requestedAmount;

      paymentGatewayFactory
        .create()
        .post(
          {
            AccountId: AccountId,
            GatewayAccountType: GatewayAccountType,
            GatewayTransactionType: GatewayTransactionType,
            GatewayEntryMode: GatewayEntryMode,
            GatewayChargeType: GatewayChargeType,
            IsSignatureRequired: IsSignatureRequired,
            RequestedAmount: RequestedAmount,
          },
          function (result) {
            paymentGatewayFactory.submitTransaction(
              result.Value,
              1,
              successCallback,
              errorCallback
            );
          }
        );
    };

    var createDebit = function (
      AccountId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired,
      successCallback,
      errorCallback
    ) {
      var GatewayAccountType = 2;
      var GatewayTransactionType = 2;
      var GatewayChargeType = 2;
      if (!signatureRequired) {
        signatureRequired = false;
      }
      var IsSignatureRequired = signatureRequired;
      var RequestedAmount = requestedAmount;

      paymentGatewayFactory
        .create()
        .post(
          {
            AccountId: AccountId,
            GatewayAccountType: GatewayAccountType,
            GatewayTransactionType: GatewayTransactionType,
            GatewayEntryMode: GatewayEntryMode,
            GatewayChargeType: GatewayChargeType,
            IsSignatureRequired: IsSignatureRequired,
            RequestedAmount: RequestedAmount,
          },
          function (result) {
            paymentGatewayFactory.submitTransaction(
              result.Value,
              1,
              successCallback,
              errorCallback
            );
          }
        );
    };

    var createPaymentProviderCreditOrDebitPayment = function (
      AccountId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired,
      accountType,
      transactionType,
      chargeType,
      paymentCategory
    ) {
      if (!signatureRequired) {
        signatureRequired = false;
      }
      var IsSignatureRequired = signatureRequired;
      var RequestedAmount = requestedAmount;

    if(paymentCategory == PaymentCategory.AccountPayment){
      return paymentGatewayFactory
      .create()
      .post(
      {
        AccountId: AccountId,
        GatewayAccountType: accountType,
        GatewayTransactionType: transactionType,
        GatewayEntryMode: GatewayEntryMode,
        GatewayChargeType: chargeType,
        IsSignatureRequired: IsSignatureRequired,
        RequestedAmount: RequestedAmount,
      }
    );
  }else if(paymentCategory == PaymentCategory.Insurance){
      return paymentGatewayFactory
      .insuranceCreate()
      .post(
        {
          AccountId: AccountId,
          GatewayAccountType: accountType,
          GatewayTransactionType:  transactionType,
          GatewayEntryMode: GatewayEntryMode,
          GatewayChargeType: chargeType,
          IsSignatureRequired: IsSignatureRequired,
          RequestedAmount: RequestedAmount,
        });

      }
      else{
      return paymentGatewayFactory
        .encounterCreate()
        .post(
          {
            AccountId: AccountId,
            GatewayAccountType: accountType,
            GatewayTransactionType: transactionType,
            GatewayEntryMode: GatewayEntryMode,
            GatewayChargeType: chargeType,
            IsSignatureRequired: IsSignatureRequired,
            RequestedAmount: RequestedAmount,
          }
        );
      }
    };

    var createPaymentProviderCreditForBulkInsurance = function (
      carrierId,
      payerId,
      paymentTypeId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired
    ) {
      var GatewayAccountType = 0;
      var GatewayTransactionType = 1;
      var GatewayChargeType = 1;
      if (!signatureRequired) {
        signatureRequired = false;
      }
      var IsSignatureRequired = signatureRequired;
      var RequestedAmount = requestedAmount;

      return  paymentGatewayFactory
        .bulkInsuranceCreate()
        .post(
          {
            CarrierId: carrierId,
            PayerId: payerId,
            PaymentTypeId: paymentTypeId,
            GatewayAccountType: GatewayAccountType,
            GatewayTransactionType: GatewayTransactionType,
            GatewayEntryMode: GatewayEntryMode,
            GatewayChargeType: GatewayChargeType,
            IsSignatureRequired: IsSignatureRequired,
            RequestedAmount: RequestedAmount,
          }
        );
    };

    var createDebitReturnForEncounter = function (
      accountId,
      requestedAmount,
      gatewayEntryMode,
      signatureRequired,
      accountType,
      transactionType,
      chargeType
    ) {
      return paymentGatewayFactory
        .encounterReturnCreate()
        .post(
          {
            AccountId: accountId,
            GatewayAccountType: accountType,
            GatewayTransactionType: transactionType,
            GatewayEntryMode: gatewayEntryMode,
            GatewayChargeType: chargeType,
            IsSignatureRequired: signatureRequired,
            RequestedAmount: requestedAmount,
          }
        );
    }

    //this is for positive adjustment credit card returns
    var positiveAdjustmentDebitCardReturn = function (
      AccountId,
      AccountMemberId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired,
      successCallback,
      errorCallback
    ) {
      var postObject = {
        AccountId: AccountId,
        AccountMemberId: AccountMemberId,
        GatewayAccountType: 2,
        GatewayTransactionType: 2,
        GatewayEntryMode: GatewayEntryMode,
        GatewayChargeType: 3,
        IsSignatureRequired: signatureRequired,
        RequestedAmount: requestedAmount,
      };
      paymentGatewayFactory.returnCreate().post(postObject, function (result) {
        paymentGatewayFactory.submitTransaction(
          result.Value,
          4,
          successCallback,
          errorCallback
        );
      });
    };

    var patientAccountDebitCardReturn = function (
      AccountId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired,
      successCallback,
      errorCallback
    ) {
      var postObject = {
        AccountId: AccountId,
        GatewayAccountType: 2,
        GatewayTransactionType: 2,
        GatewayEntryMode: GatewayEntryMode,
        GatewayChargeType: 3,
        IsSignatureRequired: signatureRequired,
        RequestedAmount: requestedAmount,
      };
      paymentGatewayFactory
        .patientAccountReturnCreate()
        .post(postObject, function (result) {
          paymentGatewayFactory.submitTransaction(
            result.Value,
            5,
            successCallback,
            errorCallback
          );
        });
    };

    var patientAccountPaymentProviderDebitCardReturn = function (
      AccountId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired,
      idOfTransactionToBeRefunded

    ) {
      var postObject = {
        AccountId: AccountId,
        GatewayAccountType: 2,
        GatewayTransactionType: 2,
        GatewayEntryMode: GatewayEntryMode,
        GatewayChargeType: 3,
        IsSignatureRequired: signatureRequired,
        RequestedAmount: requestedAmount,
        IdOfTransactionToBeRefunded:idOfTransactionToBeRefunded
      };
      return paymentGatewayFactory
        .patientAccountReturnCreate()
        .post(
          postObject
        );
    }

    var encounterDebitCardReturn = function (
      AccountId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired,
      successCallback,
      errorCallback
    ) {
      var postObject = {
        AccountId: AccountId,
        GatewayAccountType: 2,
        GatewayTransactionType: 2,
        GatewayEntryMode: GatewayEntryMode,
        GatewayChargeType: 3,
        IsSignatureRequired: signatureRequired,
        RequestedAmount: requestedAmount,
      };
      paymentGatewayFactory
        .encounterReturnCreate()
        .post(postObject, function (result) {
          paymentGatewayFactory.submitTransaction(
            result.Value,
            6,
            successCallback,
            errorCallback
          );
        });
    };

    var positiveAdjustmentCreditCardReturn = function (
      AccountId,
      AccountMemberId,
      requestedAmount,
      GatewayEntryMode,
      signatureRequired,
      successCallback,
      errorCallback
    ) {
      var postObject = {
        AccountId: AccountId,
        AccountMemberId: AccountMemberId,
        GatewayAccountType: 0,
        GatewayTransactionType: 1,
        GatewayEntryMode: GatewayEntryMode,
        GatewayChargeType: 4,
        IsSignatureRequired: signatureRequired,
        RequestedAmount: requestedAmount,
      };
      paymentGatewayFactory.returnCreate().post(postObject, function (result) {
        paymentGatewayFactory.submitTransaction(
          result.Value,
          4,
          successCallback,
          errorCallback
        );
      });

  
    };

    var completeCreditTransaction = function(
      transactionInformation,
      completeType,
      successCallback,
      errorCallback)
    {
      paymentGatewayFactory.completeCreditTransaction(transactionInformation ,completeType,successCallback,errorCallback)
    };

 
  

    return {
      createCreditForEncounter: createCreditForEncounter,
      createDebitForEncounter: createDebitForEncounter,
      createPaymentProviderCreditOrDebitPayment: createPaymentProviderCreditOrDebitPayment,
      encounterVoid: encounterVoid,
      createCreditForInsurance: createCreditForInsurance,
      createCreditForBulkInsurance: createCreditForBulkInsurance,
      createCredit: createCredit,
      createDebit: createDebit,
      createDebitReturnForEncounter: createDebitReturnForEncounter,
      positiveAdjustmentDebitCardReturn: positiveAdjustmentDebitCardReturn,
      patientAccountDebitCardReturn: patientAccountDebitCardReturn,
      encounterDebitCardReturn: encounterDebitCardReturn,
      positiveAdjustmentCreditCardReturn: positiveAdjustmentCreditCardReturn,
      completeCreditTransaction: completeCreditTransaction,
      patientAccountPaymentProviderDebitCardReturn:patientAccountPaymentProviderDebitCardReturn,
      createPaymentProviderCreditForBulkInsurance:createPaymentProviderCreditForBulkInsurance
    };
  },
]);
