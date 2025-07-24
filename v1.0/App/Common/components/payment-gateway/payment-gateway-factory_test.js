describe('payment-gateway-factory ->', function () {
  var paymentGatewayFactory, mockResource, mockWindow;

  var mockResourceReturnObject = {
    Value: {
      GatewayStatus: 3,
      RequestedAmount: 10,
      ApprovedAmount: 10,
    },
  };
  var mockResourceReturn = {
    post: jasmine.createSpy('$resource.post').and.returnValue({
      $promise: {
        then: function (callback) {
          callback(mockResourceReturnObject);
        },
      },
    }),
  };

  var mockModalFactory = {
    ConfirmModal: jasmine.createSpy('modalFactory.ConfirmModal'),
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(function () {
    mockResource = jasmine
      .createSpy('$resource')
      .and.returnValue(mockResourceReturn);
    module(function ($provide) {
      $provide.value('$resource', mockResource);
      $provide.value('ModalFactory', mockModalFactory);

      mockWindow = {
        open: jasmine.createSpy(),
        document: {
          createElement: function () {
            return { setAttribute: function () {} };
          },
          head: {
            appendChild: function () {},
          },
        },
        addEventListener: jasmine.createSpy(),
      };
      $provide.value('$window', mockWindow);
    });
  });

  beforeEach(inject(function ($injector) {
    paymentGatewayFactory = $injector.get('PaymentGatewayFactory');
  }));

  describe('initialization ->', function () {
    it('should exist', function () {
      expect(mockWindow.open).not.toHaveBeenCalled();
      expect(paymentGatewayFactory).not.toBeNull();
    });
  });

  describe('create ->', function () {
    it('should call $resource with correct parameters and return result', function () {
      var result = paymentGatewayFactory.create();
      expect(result).toEqual(mockResourceReturn);
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/accountpayment/createcredit'
      );
    });
  });

  describe('insuranceCreate ->', function () {
    it('should call $resource with correct parameters and return result', function () {
      var result = paymentGatewayFactory.insuranceCreate();
      expect(result).toEqual(mockResourceReturn);
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/insurancepayment/createcredit'
      );
    });
  });

  describe('bulkInsuranceCreate ->', function () {
    it('should call $resource with correct parameters and return result', function () {
      var result = paymentGatewayFactory.bulkInsuranceCreate();
      expect(result).toEqual(mockResourceReturn);
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/bulkinsurancepayment/createcredit'
      );
    });
  });

  describe('encounterCreate ->', function () {
    it('should call $resource with correct parameters and return result', function () {
      var result = paymentGatewayFactory.encounterCreate();
      expect(result).toEqual(mockResourceReturn);
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/encounterpayment/createcredit'
      );
    });
  });

  describe('encounterVoid ->', function () {
    it('should call $resource with correct parameters and return result', function () {
      var result = paymentGatewayFactory.encounterVoid(12);
      expect(result).toEqual(mockResourceReturn);
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/encounterpayment/void/12'
      );
    });
  });

  describe('returnCreate ->', function () {
    it('should call $resource with correct parameters and return result', function () {
      var result = paymentGatewayFactory.returnCreate();
      expect(result).toEqual(mockResourceReturn);
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/positiveadjustment/createdebit/'
      );
    });
  });

  describe('patientAccountReturnCreate ->', function () {
    it('should call $resource with correct parameters and return result', function () {
      var result = paymentGatewayFactory.patientAccountReturnCreate();
      expect(result).toEqual(mockResourceReturn);
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/accountpayment/debitreturn/'
      );
    });
  });

  describe('encounterReturnCreate ->', function () {
    it('should call $resource with correct parameters and return result', function () {
      var result = paymentGatewayFactory.encounterReturnCreate();
      expect(result).toEqual(mockResourceReturn);
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/encounterpayment/debitreturn/'
      );
    });
  });

  describe('checkVoid ->', function () {
    it('should call $resource with correct parameters and return result', function () {
      var result = paymentGatewayFactory.checkVoid(13);
      expect(result).toEqual(mockResourceReturn);
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/accountPayment/isVoided/13'
      );
    });
  });

  describe('checkVoidInsurance ->', function () {
    it('should call $resource with correct parameters and return result', function () {
      var result = paymentGatewayFactory.checkVoidInsurance(14);
      expect(result).toEqual(mockResourceReturn);
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/insurancePayment/isVoided/14'
      );
    });
  });

  describe('submitTransaction ->', function () {
    beforeEach(function () {
      jasmine.clock().install();
      mockWindow.open = jasmine.createSpy().and.returnValue({
        document: {
          write: jasmine.createSpy('window.document.write'),
        },
        closed: true,
      });
      mockResourceReturnObject = {
        Value: {
          GatewayStatus: 3,
          RequestedAmount: 10,
          ApprovedAmount: 10,
        },
      };
      mockModalFactory.ConfirmModal = jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        });
    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });

    it('should open a new window for open edge, complete transaction for account payment, and callback when callback included', function () {
      var success = jasmine.createSpy('successCallback');
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999 },
        1,
        success
      );
      jasmine.clock().tick(501);
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/accountpayment/complete/999'
      );
      expect(success).toHaveBeenCalled();
    });

    it('should open a new window for open edge, complete transaction for insurance payment, and callback when callback included', function () {
      var success = jasmine.createSpy('successCallback');
      mockModalFactory.ConfirmModal = jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        });
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999 },
        2,
        success
      );
      jasmine.clock().tick(501);
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/insurancepayment/complete/999'
      );
      expect(success).toHaveBeenCalled();
    });

    it('should open a new window for open edge, complete transaction for bulk insurance payment, and callback when callback included', function () {
      var success = jasmine.createSpy('successCallback');
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999 },
        7,
        success
      );
      jasmine.clock().tick(501);
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/bulkinsurancepayment/complete/999'
      );
      expect(success).toHaveBeenCalled();
    });

    it('should open a new window for open edge, complete transaction for encounter payment, throw confirm modal on partial approval, and callback when callback included', function () {
      var success = jasmine.createSpy('successCallback');
      mockResourceReturnObject.Value.ApprovedAmount = 5;
      mockModalFactory.ConfirmModal = jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        });
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999 },
        3,
        success
      );
      jasmine.clock().tick(501);
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/encounterpayment/complete/999'
      );
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
      expect(success).toHaveBeenCalledWith(999, 5);
    });

    it('should open a new window for open edge, complete transaction for encounter payment, throw confirm modal on partial approval, and undo payment on decline of partial payment', function () {
      var success = jasmine.createSpy('successCallback');
      var error = jasmine.createSpy('errorCallback');
      mockResourceReturnObject.Value.ApprovedAmount = 5;
      mockModalFactory.ConfirmModal = jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.returnValue({
          then: function (callback, declineCallback) {
            declineCallback();
          },
        });
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999 },
        3,
        success,
        error
      );
      jasmine.clock().tick(501);
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.count()).toEqual(2);
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/encounterpayment/void/999'
      );
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
      expect(success).not.toHaveBeenCalledWith(999, 5);
    });

    it('should open a new window for open edge, complete transaction for positive adjustment, throw error modal on failure and callback when failure callback included', function () {
      var success = jasmine.createSpy('successCallback');
      var failure = jasmine.createSpy('failureCallback');
      mockResourceReturnObject.Value.GatewayStatus = 4;
      mockResourceReturnObject.Value.SecondaryResponseMessage =
        'Transaction Failed';
      mockResourceReturnObject.Value.SecondaryResponseCode = 400;
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999 },
        4,
        success,
        failure
      );
      jasmine.clock().tick(501);
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/positiveadjustment/complete/999'
      );
      expect(mockModalFactory.ConfirmModal.calls.mostRecent().args[1]).toEqual(
        'Payment Declined, Transaction Failed. Response Code: 400'
      );
      expect(success).not.toHaveBeenCalled();
      expect(failure).toHaveBeenCalled();
    });

    it('should open a new window for open edge, complete transaction for account payment return, and call success callback when included', function () {
      var success = jasmine.createSpy('successCallback');
      var failure = jasmine.createSpy('failureCallback');
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999 },
        5,
        success,
        failure
      );
      jasmine.clock().tick(501);
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/accountpayment/debitreturn/complete/999'
      );
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
      expect(failure).not.toHaveBeenCalled();
    });

    it('should open a new window for open edge, complete transaction for encounter payment return, throw error message on failure, and call failure callback when included', function () {
      var success = jasmine.createSpy('successCallback');
      var failure = jasmine.createSpy('failureCallback');
      mockResourceReturnObject.Value.GatewayStatus = 4;
      mockResourceReturnObject.Value.SecondaryResponseMessage = 'NULL';
      mockResourceReturnObject.Value.SecondaryResponseCode = 400;
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999 },
        6,
        success,
        failure
      );
      jasmine.clock().tick(501);
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/encounterpayment/debitreturn/complete/999'
      );
      expect(mockModalFactory.ConfirmModal.calls.mostRecent().args[1]).toEqual(
        'Payment Declined, No Reason Given. Response Code: 400'
      );
      expect(success).not.toHaveBeenCalled();
      expect(failure).toHaveBeenCalled();
    });

    it('should open declined modal with no reason given when secondaryResponseMessage is null', function () {
      var success = jasmine.createSpy('successCallback');
      var failure = jasmine.createSpy('failureCallback');
      mockResourceReturnObject.Value.GatewayStatus = 4;
      mockResourceReturnObject.Value.SecondaryResponseMessage = null;
      mockResourceReturnObject.Value.SecondaryResponseCode = 400;
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999 },
        6,
        success,
        failure
      );
      jasmine.clock().tick(501);
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/encounterpayment/debitreturn/complete/999'
      );
      expect(mockModalFactory.ConfirmModal.calls.mostRecent().args[1]).toEqual(
        'Payment Declined, No Reason Given. Response Code: 400'
      );
      expect(success).not.toHaveBeenCalled();
      expect(failure).toHaveBeenCalled();
    });

    it('should throw modal when return status is 5 and not a credit card', function () {
      var success = jasmine.createSpy('successCallback');
      var failure = jasmine.createSpy('failureCallback');
      mockResourceReturnObject.Value.GatewayStatus = 5;
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999, GatewayTransactionType: 2 },
        1,
        success,
        failure
      );
      jasmine.clock().tick(501);
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/accountpayment/complete/999'
      );
      expect(mockModalFactory.ConfirmModal.calls.mostRecent().args[1]).toEqual(
        'The credit card machine has failed to complete the transaction.'
      );
      expect(success).not.toHaveBeenCalled();
      expect(failure).toHaveBeenCalled();
    });

    it('should throw keyed modal when return status is 5 and is a credit card and set keyed entry session variable to true on confirm', function () {
      var success = jasmine.createSpy('successCallback');
      var failure = jasmine.createSpy('failureCallback');
      mockResourceReturnObject.Value.GatewayStatus = 5;
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999, GatewayTransactionType: 1 },
        1,
        success,
        failure
      );
      jasmine.clock().tick(501);
      sessionStorage.removeItem('keyedEntry');
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/accountpayment/complete/999'
      );
      expect(mockModalFactory.ConfirmModal.calls.mostRecent().args[1]).toEqual(
        'The credit card machine has failed to complete the transaction. Would you like to complete a keyed entry now?'
      );
      expect(success).not.toHaveBeenCalled();
      expect(failure).not.toHaveBeenCalled();
      expect(sessionStorage.getItem('keyedEntry')).toEqual('true');
    });

    it('should not throw keyed modal when return status is 5 and is a credit card and another tab has aborted the process', function () {
      localStorage.setItem('abortOpenEdge', true);
      var success = jasmine.createSpy('successCallback');
      var failure = jasmine.createSpy('failureCallback');
      mockResourceReturnObject.Value.GatewayStatus = 5;
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999, GatewayTransactionType: 1 },
        1,
        success,
        failure
      );
      jasmine.clock().tick(501);
      sessionStorage.removeItem('keyedEntry');
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/accountpayment/complete/999'
      );
      expect(mockModalFactory.ConfirmModal.calls.mostRecent().args[1]).toEqual(
        'The credit card machine has failed to complete the transaction.'
      );
      expect(failure).toHaveBeenCalled();
    });

    it('should call failure callback on failure when keyedentry is false', function () {
      var success = jasmine.createSpy('successCallback');
      var failure = jasmine.createSpy('failureCallback');
      mockResourceReturnObject.Value.GatewayStatus = 5;
      sessionStorage.setItem('keyedEntry', 'false');
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999, GatewayTransactionType: 1 },
        1,
        success,
        failure
      );
      jasmine.clock().tick(501);
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockResource.calls.mostRecent().args[0]).toEqual(
        '_insurancesapi_/paymentGateway/accountpayment/complete/999'
      );
      expect(mockModalFactory.ConfirmModal.calls.mostRecent().args[1]).toEqual(
        'The credit card machine has failed to complete the transaction.'
      );
      expect(success).not.toHaveBeenCalled();
      expect(failure).toHaveBeenCalled();
    });

    it('should thow modal and error callback when write to new window throws error', function () {
      mockWindow.open = jasmine.createSpy('mockWindow.open').and.returnValue({
        document: {
          write: jasmine
            .createSpy('window.document.write')
            .and.callFake(function () {
              throw 'error';
            }),
        },
        closed: false,
        close: jasmine.createSpy('window.close'),
      });

      mockModalFactory.ConfirmModal = jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.returnValue({
          then: function (callback, declineCallback) {
            declineCallback();
          },
        });
      var error = jasmine.createSpy('errorCallback');
      paymentGatewayFactory.submitTransaction(
        { PaymentGatewayTransactionId: 999, GatewayTransactionType: 1 },
        1,
        null,
        error
      );
      expect(mockWindow.open).toHaveBeenCalled();
      expect(mockModalFactory.ConfirmModal.calls.mostRecent().args[1]).toEqual(
        'A credit card payment was already started on another tab and has been canceled.  Do you wish to continue with the current payment?'
      );
      expect(mockResource).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });
  });

  describe('isWindowOpen ->', function () {
    it('should return undefined when no openedgewindow', function () {
      var res = paymentGatewayFactory.isWindowOpen();
      expect(res).toBe(false);
    });
  });

  describe('completeCreditTransaction',function () {
    it('should call the correct URL for completeType 3 (encounterpayment)', function() {
      // Setup input data
      var transactionInformation = { PaymentGatewayTransactionId: '12345' };
      var completeTypeParam = 3;

      // Mock success callback
      var successCallbackFn = jasmine.createSpy('successCallbackFn');

      // Call the function
      paymentGatewayFactory.completeCreditTransaction(transactionInformation, completeTypeParam, successCallbackFn, null);

      // Check that the success callback was invoked
      expect(successCallbackFn).toHaveBeenCalled();
      
      // Verify that $resource.post was called with the expected URL
      var expectedUrl = '_insurancesapi_/paymentGateway/encounterpayment/complete/12345';
      expect(mockResource.calls.mostRecent().args[0]).toEqual(expectedUrl);
    });

    it('should handle success response correctly for completeType 3', function() {
      var transactionInformation = { PaymentGatewayTransactionId: '12345' };
      var completeTypeParam = 3;

      var successCallbackFn = jasmine.createSpy('successCallbackFn');
      paymentGatewayFactory.completeCreditTransaction(transactionInformation, completeTypeParam, successCallbackFn, null);

      // Verify success callback was called
      expect(successCallbackFn).toHaveBeenCalledWith('12345'); // call with transactionId
    });
  });
});
