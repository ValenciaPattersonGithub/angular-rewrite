describe('payment-gateway-service ->', function () {
  var paymentGatewayService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.services'));

  beforeEach(inject(function ($injector) {
    paymentGatewayService = $injector.get('PaymentGatewayService');
  }));

  describe('initialization ->', function () {
    it('should exist', function () {
      expect(paymentGatewayService).not.toBeNull();
    });
  });
});
