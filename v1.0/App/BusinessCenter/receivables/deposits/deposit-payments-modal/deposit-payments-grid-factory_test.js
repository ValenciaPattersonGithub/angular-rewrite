describe('deposit-payments-grid-factory ->', function () {
  var factory;

  // #region Setup

  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($injector) {
    factory = $injector.get('DepositPaymentsGridFactory');
  }));

  // #endregion

  // #region Tests

  it('should exist', function () {
    expect(factory).toBeDefined();
  });

  describe('getOptions function ->', function () {
    it('should contain Payment Type and Additional Info columns', function () {
      var results = factory.getOptions();

      var paymentTypeColumn = _.find(results.columnDefinition, {
        title: 'Payment Type',
      });
      var additionalInfoColumn = _.find(results.columnDefinition, {
        title: 'Additional Info',
      });

      expect(paymentTypeColumn).toBeDefined();
      expect(additionalInfoColumn).toBeDefined();
    });

    it('should escape Payment Type and Additional Info columns', function () {
      var results = factory.getOptions();

      var paymentTypeColumn = _.find(results.columnDefinition, {
        title: 'Payment Type',
      });
      var additionalInfoColumn = _.find(results.columnDefinition, {
        title: 'Additional Info',
      });

      var paymentTypeTest = paymentTypeColumn.template[0]('<img />');
      var additionalInfoTest = additionalInfoColumn.template[0]('<img />');

      expect(paymentTypeTest).toBe(_.escape('<img />'));
      expect(additionalInfoTest).toBe(_.escape('<img />'));
    });
  });

  //#endregion
});
